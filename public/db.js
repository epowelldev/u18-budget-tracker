let db;

const dbReq = indexedDB.open("budget", 1);

dbReq.onupgradedneeded = e => {
  db = e.target.result;
  db.createObjectStore("pending", {autoIncrement: true});
};

dbReq.onsuccess = e => {
  db = e.target.result;
  if (navigator.onLine) {checkDBConnection()};
};

dbReq.onerror = err => {
  console.error(err);
};

const saveRecord = record => {
  db
    .transaction(["pending"], "readwrite")
    .objectStore("pending")
    .add(record);
};

const checkDBConnection = () => {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = () => {
    if(getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*", "Content-Type": "application/json",
        },
      })
      .then(res => res.json())
      .then(() => {
        const transaction = db.transaction(["pending"], "readwrite");
        const store = transaction.objectStore("pending");
        store.clear();
      })
    }
  }
}

window.addEventListener("online", checkDBConnection);
