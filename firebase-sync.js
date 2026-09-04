const config = window.CASA_FIREBASE_CONFIG;
if (config) {
  const [{ initializeApp }, { getAuth, signInAnonymously }, { getDatabase, ref, onValue, set }] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js')
  ]);
  const app = initializeApp(config);
  await signInAnonymously(getAuth(app));
  const database = getDatabase(app);
  const homeId = new URLSearchParams(location.search).get('home') || localStorage.getItem('casa-home');
  const houseRef = ref(database, `homes/${homeId}`);
  window.dispatchEvent(new CustomEvent('casa-sync-ready', { detail: {
    save: data => set(houseRef, data),
    watch: callback => onValue(houseRef, snapshot => callback(snapshot.val()))
  }}));
}
