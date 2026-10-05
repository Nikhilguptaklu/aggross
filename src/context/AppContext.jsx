import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getReleasePackages as svcGetAll,
  getReleasePackage as svcGet,
  createReleasePackage as svcCreate,
  updateReleasePackage as svcUpdate,
  saveVersionSnapshot as svcSaveVersion,
  setReleaseStatus as svcSetStatus,
  setSummaryStatus as svcSetSummaryStatus,
  deleteReleasePackage as svcDelete,
} from "../services/releaseService";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [packages, setPackages] = useState([]);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPackageId, setCurrentPackageId] = useState(null);

  const refreshPackages = useCallback(async () => {
    setLoading(true);
    const data = await svcGetAll();
    setPackages(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshPackages();
  }, [refreshPackages]);

  const selectPackage = useCallback(async (id) => {
    if (!id) {
      setCurrentPackage(null);
      setCurrentPackageId(null);
      return;
    }
    setCurrentPackageId(id);
    const pkg = await svcGet(id);
    setCurrentPackage(pkg);
    return pkg;
  }, []);

  const createPackage = useCallback(async (data) => {
    const pkg = await svcCreate(data);
    await refreshPackages();
    return pkg;
  }, [refreshPackages]);

  const updatePackage = useCallback(async (id, data) => {
    const updated = await svcUpdate(id, data);
    if (id === currentPackageId) setCurrentPackage(updated);
    await refreshPackages();
    return updated;
  }, [currentPackageId, refreshPackages]);

  const saveVersion = useCallback(async (id, versionLabel, changeSummary, author) => {
    const ver = await svcSaveVersion(id, versionLabel, changeSummary, author);
    return ver;
  }, []);

  const setPackageStatus = useCallback(async (id, status) => {
    const updated = await svcSetStatus(id, status);
    if (id === currentPackageId) setCurrentPackage(updated);
    await refreshPackages();
    return updated;
  }, [currentPackageId, refreshPackages]);

  const setSummaryReviewStatus = useCallback(async (releaseId, type, status) => {
    const updated = await svcSetSummaryStatus(releaseId, type, status);
    if (releaseId === currentPackageId) setCurrentPackage(updated);
    await refreshPackages();
    return updated;
  }, [currentPackageId, refreshPackages]);

  const deletePackage = useCallback(async (id) => {
    await svcDelete(id);
    if (id === currentPackageId) {
      setCurrentPackage(null);
      setCurrentPackageId(null);
    }
    await refreshPackages();
  }, [currentPackageId, refreshPackages]);

  const value = {
    packages,
    currentPackage,
    currentPackageId,
    loading,
    refreshPackages,
    selectPackage,
    createPackage,
    updatePackage,
    saveVersion,
    setPackageStatus,
    setSummaryReviewStatus,
    deletePackage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
