export type PreviewScreen = "home" | "buscar" | "ficha" | "publicar" | "cuenta";
export type PreviewArch = "actual" | "propuesta" | "ambas";
export type FormMode = "conservador" | "lados" | "narrativa";
export type PublishResult = "inmediata" | "pendiente" | null;

export type PreviewController = {
  go: (screen: PreviewScreen) => void;
  query: string;
  setQuery: (value: string) => void;
  fichaId: string;
  openFicha: (id: string) => void;
  openPublish: (id: string | null) => void;
  cityFilter: string | null;
  setCityFilter: (city: string | null) => void;
  formMode: FormMode;
  result: PublishResult;
  setResult: (result: PublishResult) => void;
  publishAgencyId: string | null;
};
