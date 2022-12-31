## 1.4.1
- Fix reactive counters when filtering on dates [@vparpoil](https://github.com/vparpoil) [PR](https://github.com/cult-of-coders/grapher/pull/402)
- Fix for storeOneResults when handling already processed results [@bhunjadi](https://github.com/bhunjadi) [PR](https://github.com/cult-of-coders/grapher/pull/405)
- Replace `_.isArray` with native `Array.isArray` [@storytellercz](https://github.com/sponsors/StorytellerCZ)
- Remove unnecessary applyProps call [@Floriferous](https://github.com/Floriferous) [PR](https://github.com/cult-of-coders/grapher/pull/419)
- Add tests for Meteor 2.9.1 [@storytellercz](https://github.com/sponsors/StorytellerCZ)

## 1.4.0
- Add tests for Meteor 2.6 & 2.7.3
- Migrate TravisCI test to GitHub Actions
- Fix failed queries in Meteor 2.6 due to custom aggregate function
- Updated for mongo 5 support
- Added compose file for testing

## 1.3.21
- Update `matb33:collection-hooks` to v1.1.2

## 1.3.20
- Omit `$expr` operator from projected field names
- Improve fetchOne to only return 1 result
- Fix add support for input types to `getArgs`
- Fix global exposure function body usage
- Corrects error messages thrown by linkMany
- Updated dependencies for Meteor 2.3+

## 1.3
- Added link caching
- Added named query results caching
- Added subbody to NamedQuery
- Added named query first resolver
- Bug fixes and other small stuff

## 1.2.5 
- Support for promises via .fetchSync and .fetchOneSync for client-side queries
- Support for autoremove from inverse side as well
- Fixed .fetchOne from client-side Query

## 1.2.4
- Fixed #55, #60, #61, #66
- Added Reducers Concept
- 

## 1.2.3
- Added $paginate: true, at the first level body which puts as options limit and skip from params automatically
- Exported "prepareForProcess" so Grapher Live can use it
- Fixed implying packages for broader adoption

## 1.2.2_x
- Bug fixes and improvements

## 1.2.2 
- Metadata is now available on the client
- Decoupled code better

## 1.2.0 & 1.2.1
- Added $meta filters for filtering linked items by their metadata
- Extended exposure body to accept deep functions that are computed on-demand
- Fixed issues with $metadata

## 1.1.14
- For security reasons, every node value should be truthy. Meaning undefined, 0, and false will be ignored.
- Graph intersection for exposure, will not intersect if the body of exposure has a field that contains "false" or "undefined"

## 1.1.13
- Added deep function computing to the body to allow code-reusability

## 1.1.12
- Added body to exposure that will intersect with the actual request

## 1.1.11
- Written rigurous unit tests for deep cloning
- Auto-adding $metadata field when coming from an inversed link.
- Separated and decoupled client-side and server-side queries

## 1.1.10
- Fixed issue with deep cloning and arrays

## 1.1.9
- Added .clone() to Query
- Added namedQuery concept. 
- Direct meta-children are automatically appended with $metadata
- Added .fetchOne() to Query
- Modified Documentor so it returns queries also.
- Fixed bug with deep $filter() function
- Added deepCloning ability that solved some weird bugs.

## 1.1.6 , 1.1.7 , 1.1.8
- Exposing documentation so it can be used by grapher live.
- Updated readme links

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
