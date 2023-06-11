const currentVersion = "1";
const versionKey = "version";

const savedVersion = localStorage.getItem(versionKey);
if (currentVersion != savedVersion) {
  localStorage.clear();
  localStorage.setItem(versionKey, currentVersion);
}
