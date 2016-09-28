## 1.1.5
- Added ability to allow publication or method or both or none via expose() api.
- Exposure.restrictLinks now filters in depth with $and/$nor/$or/$not logical mongodb operators.
- Added restrictLinks at expose level, and you can use it as an array, or function: restrictLinks(userId) => returns array of links

## 1.1.4
- Decoupled query fetcher better, removing automatically "skip" option when fetching as client
- Ability to allow skip when you want custom behavior

## 1.1.3
- Added count method to allow pagination
- restrictFields not throws propper error when invalid

## 1.1.2
- Bug fixes for oneResults

## 1.1.1
- Extend the way exposure works. Added "maxLimit", "maxDepth", "restrictedFields" as configuration options for it.

## 1.1.0
- Added hypernova module which reduces queries to the database dramatically.
- Added a way to link collections via string when using addLinks
- Added "unique" parameter available to "One" and "One Meta" relationships, that adds a unique index into the database,
and when you fetch them from their inversed side, it will return a single value instead of an array.

## 1.0.10
- Fixed a bug with cleaning the field.
- Fixed the bug where you had one virtual collection, and all the other fields were applied

## 1.0.9
- restrictFields in the exposure module is now filtering-out "filters" and "sort" to avoid information exposure.

## 1.0.8
- Fixed reactive fetching when using inversed links

## 1.0.7
- Optimized creating link for _id only, by fetching the object with the storage field only
- Added restrictFields in the exposure module to easily restrictFields

## 1.0.6
- Fixed exposure bug for static fetching
- Exporting useful components that allow you to customly build your data graph

## 1.0.4
- Index for meta will now only index _id
- You can now perform actions from the inversed links

## 1.0.3
- Added autoremove support to cascade delete links.
- When adding/setting objects that have no _id defined, it automatically inserts them into the database and makes the link.
- Added ability to chain link methods that affect the data
- Added ability to index the added links.
- Added $all special field, which will retrieve all the possible fields unless it's secured in exposure.

## 1.0.2
Simplified subscription and decided to keep "linkStorageFields" in the response.

## 1.0.1
Bug fixes + Updated documentation

## 1.0.0
First release.