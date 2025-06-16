export const downloadJSON = (data, filename) => {
  try {
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const downloadLink = document.createElement("a");

    downloadLink.href = URL.createObjectURL(jsonBlob);
    downloadLink.download = filename;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => URL.revokeObjectURL(downloadLink.href), 100);

  } catch (e) {
    console.error("Erreur lors du téléchargement du fichier JSON :", e);
  }
};
