export const createProgressMap = (progressDocs = []) =>
  progressDocs.reduce((accumulator, progress) => {
    accumulator[String(progress.course)] = (progress.completedMaterials || []).map((item) =>
      String(item)
    );
    return accumulator;
  }, {});

export const isMaterialCompleted = (progressMap = {}, courseId, materialId) => {
  if (!courseId || !materialId) return false;
  return (progressMap[String(courseId)] || []).includes(String(materialId));
};

export const getCourseProgress = (progressMap = {}, course) => {
  const materials = course?.materials || [];
  const total = materials.length;

  if (!total) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const completedItems = progressMap[String(course._id)] || [];
  const completed = materials.reduce((count, material) => {
    const materialId = material?._id ? String(material._id) : null;
    return materialId && completedItems.includes(materialId) ? count + 1 : count;
  }, 0);

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
};

export const upsertProgressMap = (progressMap = {}, courseId, materialId, completed) => {
  const courseKey = String(courseId);
  const materialKey = String(materialId);
  const current = progressMap[courseKey] || [];

  const next = completed
    ? current.includes(materialKey)
      ? current
      : [...current, materialKey]
    : current.filter((item) => item !== materialKey);

  return {
    ...progressMap,
    [courseKey]: next,
  };
};
