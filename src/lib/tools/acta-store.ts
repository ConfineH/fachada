import type { HandoverActa } from "@/lib/domain/tools/handover";

const DB_NAME = "fachada-acta";
const STORE = "records";
const DRAFT_KEY = "draft";
const BASELINE_KEY = "baseline";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("No se ha podido abrir el almacenamiento local."));
  });
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = run(tx.objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("No se ha podido leer el acta local."));
    });
  } finally {
    db.close();
  }
}

export function saveActaDraft(acta: HandoverActa): Promise<void> {
  return withStore("readwrite", (store) => store.put(acta, DRAFT_KEY)).then(() => undefined);
}

export function loadActaDraft(): Promise<HandoverActa | null> {
  return withStore<HandoverActa | undefined>("readonly", (store) => store.get(DRAFT_KEY)).then(
    (value) => value ?? null,
  );
}

export function saveActaBaseline(acta: HandoverActa): Promise<void> {
  return withStore("readwrite", (store) => store.put(acta, BASELINE_KEY)).then(() => undefined);
}

export function loadActaBaseline(): Promise<HandoverActa | null> {
  return withStore<HandoverActa | undefined>("readonly", (store) => store.get(BASELINE_KEY)).then(
    (value) => value ?? null,
  );
}
