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