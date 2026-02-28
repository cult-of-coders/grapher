namespace Mongo {
  interface CollectionStatic {
    get: <T, U = T>(name: string) => Collection<T, U>;
  }
}
