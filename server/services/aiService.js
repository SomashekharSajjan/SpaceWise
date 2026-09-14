const getStorageHealth = (gmail, drive) => {
  let score = 100;
  let suggestions = [];

  if (gmail.messagesTotal > 10000) {
    score -= 15;
    suggestions.push("Delete or archive old emails.");
  }

  if (drive.totalFiles > 500) {
    score -= 10;
    suggestions.push("Organize your Google Drive files.");
  }

  if (drive.pdfs > 100) {
    score -= 5;
    suggestions.push("Review old PDF documents.");
  }

  if (drive.videos > 20) {
    score -= 10;
    suggestions.push("Large videos may be using significant storage.");
  }

  return {
    score,
    suggestions,
  };
};

module.exports = {
  getStorageHealth,
};