# Steps done

1. Installed 3.0.0-beta.0 tests and added in api.versionFrom()
2. Removed dependencies that don't support Meteor v3 (denormalize)
3. Fixed dburles:mongo-collection-instances@0.4.0: using v1.0.0 from local packages dir
4. Tried running with peerlibrary:subscription-scope@0.5.0. Not working because of dependencies mismatch.

### dburles:mongo-collection-instances@0.4.0

```bash
MONGO_URL= METEOR_PACKAGE_DIRS="../" TEST_BROWSER_DRIVER=chrome meteor test-packages --once  --port 3010 ../
[[[[[ Tests ]]]]]

=> Started proxy.
=> Build failed:

   While selecting package versions:
   error: Conflict: Constraint mongo@1.0.8 || 1.12.0 || 1.16.0 is not satisfied by mongo 2.0.0-beta300.0.
   Constraints on package "mongo":
   * mongo@~2.0.0-beta300.0 <- top level
   * mongo@2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * mongo@2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * mongo@1.12.0 || 1.16.1 || 2.0.0-beta300.0 <- matb33:collection-hooks 1.3.1 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * mongo@1.12.0 || 1.16.1 || 2.0.0-beta300.0 <- matb33:collection-hooks 1.3.1 <- local-test:cultofcoders:grapher 1.5.0
   * mongo@1.0.8 || 1.12.0 || 1.16.0 <- dburles:mongo-collection-instances 0.4.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * mongo@1.0.8 || 1.12.0 || 1.16.0 <- dburles:mongo-collection-instances 0.4.0 <- local-test:cultofcoders:grapher 1.5.0
   * mongo@1.16.8 || 2.0.0-beta300.0 <- lai:collection-extensions 1.0.0-beta300.1 <- dburles:mongo-collection-instances 0.4.0 <-
   cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * mongo@1.16.8 || 2.0.0-beta300.0 <- lai:collection-extensions 1.0.0-beta300.1 <- dburles:mongo-collection-instances 0.4.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * mongo@2.0.0-beta300.0 <- tinytest 2.0.0-beta300.0 <- test-in-browser 1.4.0-beta300.0
   * mongo@2.0.0-beta300.0 <- reactive-dict 1.3.2-beta300.0 <- session 1.2.2-beta300.0 <- test-in-browser 1.4.0-beta300.0

   Conflict: Constraint lai:collection-extensions@0.4.0 is not satisfied by lai:collection-extensions 1.0.0-beta300.1.
   Constraints on package "lai:collection-extensions":
   * lai:collection-extensions@0.4.0 <- dburles:mongo-collection-instances 0.4.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * lai:collection-extensions@0.4.0 <- dburles:mongo-collection-instances 0.4.0 <- local-test:cultofcoders:grapher 1.5.0
```

Resolved by adding local package pointing to 3.0 migrate branch.

### peerlibrary:subscription-scope@0.5.0

```bash
MONGO_URL= METEOR_PACKAGE_DIRS="../:packages" TEST_BROWSER_DRIVER=chrome meteor test-packages --once  --port 3010 ../
   Selecting package versions                |
   Selecting package versions                |


[[[[[ Tests ]]]]]

=> Started proxy.
   Selecting package versions                \
=> Build failed:

   While selecting package versions:
   error: Conflict: Constraint peerlibrary:subscription-scope@0.5.0 is not satisfied by peerlibrary:subscription-scope 0.1.0.
   Constraints on package "peerlibrary:subscription-scope":
   * peerlibrary:subscription-scope@0.5.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0

   Conflict: Constraint minimongo@1.0.6 is not satisfied by minimongo 2.0.0-beta300.0.
   Constraints on package "minimongo":
   * minimongo@~2.0.0-beta300.0 <- top level
   * minimongo@2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * minimongo@2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * minimongo@2.0.0-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * minimongo@2.0.0-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * minimongo@1.7.0 || 1.9.0 || 2.0.0-beta300.0 <- matb33:collection-hooks 1.3.1 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * minimongo@1.7.0 || 1.9.0 || 2.0.0-beta300.0 <- matb33:collection-hooks 1.3.1 <- local-test:cultofcoders:grapher 1.5.0
   * minimongo@1.0.6 <- peerlibrary:subscription-scope 0.1.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher
   1.5.0

   Conflict: Constraint meteor@1.1.5 is not satisfied by meteor 2.0.0-beta300.0.
   Constraints on package "meteor":
   * meteor@~2.0.0-beta300.0 <- top level
   * meteor@2.0.0-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- core-runtime 1.0.0-beta300.0 <- meteor 2.0.0-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo
   2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- core-runtime 1.0.0-beta300.0 <- meteor 2.0.0-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo
   2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- core-runtime 1.0.0-beta300.0 <- meteor 2.0.0-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- webapp 2.0.0-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- react-fast-refresh 0.2.8-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0
   <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- react-fast-refresh 0.2.8-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0
   <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- react-fast-refresh 0.2.8-beta300.0 <- ecmascript 0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- modules 0.19.1-beta300.0 <- babel-runtime 1.5.2-beta300.0 <- ecmascript 0.16.8-beta300.0 <-
   allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- modules 0.19.1-beta300.0 <- babel-runtime 1.5.2-beta300.0 <- ecmascript 0.16.8-beta300.0 <-
   allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- modules 0.19.1-beta300.0 <- babel-runtime 1.5.2-beta300.0 <- ecmascript 0.16.8-beta300.0 <-
   autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- modules 0.19.1-beta300.0 <- ecmascript 0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- modules-runtime 0.13.2-beta300.0 <- modules 0.19.1-beta300.0 <- babel-runtime 1.5.2-beta300.0 <-
   ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- modules-runtime 0.13.2-beta300.0 <- modules 0.19.1-beta300.0 <- babel-runtime 1.5.2-beta300.0 <-
   ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- modules-runtime 0.13.2-beta300.0 <- modules 0.19.1-beta300.0 <- babel-runtime 1.5.2-beta300.0 <-
   ecmascript 0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- modules-runtime 0.13.2-beta300.0 <- modules 0.19.1-beta300.0 <- ecmascript 0.16.8-beta300.0 <-
   autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <- babel-compiler 7.11.0-beta300.0 <- ecmascript
   0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <- babel-compiler 7.11.0-beta300.0 <- ecmascript
   0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <- babel-compiler 7.11.0-beta300.0 <- ecmascript
   0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <- ecmascript 0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime-client 0.12.2-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <-
   babel-compiler 7.11.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime-client 0.12.2-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <-
   babel-compiler 7.11.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime-client 0.12.2-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <-
   babel-compiler 7.11.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime-client 0.12.2-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <- ecmascript
   0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- promise 1.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- modern-browsers 0.1.10-beta300.0 <- babel-compiler 7.11.0-beta300.0 <- ecmascript
   0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- modern-browsers 0.1.10-beta300.0 <- babel-compiler 7.11.0-beta300.0 <- ecmascript
   0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- modern-browsers 0.1.10-beta300.0 <- babel-compiler 7.11.0-beta300.0 <- ecmascript
   0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- modern-browsers 0.1.10-beta300.0 <- webapp 2.0.0-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime-server 0.11.1-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <-
   babel-compiler 7.11.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime-server 0.11.1-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <-
   babel-compiler 7.11.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime-server 0.11.1-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <-
   babel-compiler 7.11.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- ecmascript-runtime-server 0.11.1-beta300.0 <- ecmascript-runtime 0.8.2-beta300.0 <- ecmascript
   0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- babel-runtime 1.5.2-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <-
   mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- babel-runtime 1.5.2-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <-
   mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- babel-runtime 1.5.2-beta300.0 <- ecmascript 0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- dynamic-import 0.7.4-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <-
   mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- dynamic-import 0.7.4-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <-
   mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- dynamic-import 0.7.4-beta300.0 <- ecmascript 0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- fetch 0.1.4-beta300.0 <- dynamic-import 0.7.4-beta300.0 <- ecmascript 0.16.8-beta300.0 <-
   allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- fetch 0.1.4-beta300.0 <- dynamic-import 0.7.4-beta300.0 <- ecmascript 0.16.8-beta300.0 <-
   allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- fetch 0.1.4-beta300.0 <- dynamic-import 0.7.4-beta300.0 <- ecmascript 0.16.8-beta300.0 <-
   autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- inter-process-messaging 0.1.2-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- babel-compiler 7.11.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <-
   mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- babel-compiler 7.11.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- allow-deny 2.0.0-beta300.0 <-
   mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- babel-compiler 7.11.0-beta300.0 <- ecmascript 0.16.8-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- logging 1.3.3-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- logging 1.3.3-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ejson 1.1.4-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ejson 1.1.4-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ejson 1.1.4-beta300.0 <- check 1.3.3-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- base64 1.0.13-beta300.0 <- ejson 1.1.4-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo
   2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- base64 1.0.13-beta300.0 <- ejson 1.1.4-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo
   2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- base64 1.0.13-beta300.0 <- ejson 1.1.4-beta300.0 <- check 1.3.3-beta300.0 <- autoupdate
   2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- typescript 4.9.5-beta300.0 <- logging 1.3.3-beta300.0 <- mongo 2.0.0-beta300.0 <-
   cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- typescript 4.9.5-beta300.0 <- logging 1.3.3-beta300.0 <- mongo 2.0.0-beta300.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- underscore 1.0.14-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher
   1.5.0
   * meteor@2.0.0-beta300.0 <- underscore 1.0.14-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- routepolicy 1.1.2-beta300.0 <- ddp-server 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- routepolicy 1.1.2-beta300.0 <- ddp-server 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- routepolicy 1.1.2-beta300.0 <- ddp-server 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- autoupdate
   2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- routepolicy 1.1.2-beta300.0 <- webapp 2.0.0-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- boilerplate-generator 2.0.0-beta300.0 <- webapp 2.0.0-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- webapp-hashing 1.1.2-beta300.0 <- webapp 2.0.0-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- callback-hook 1.6.0-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- callback-hook 1.6.0-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- callback-hook 1.6.0-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- autoupdate
   2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- callback-hook 1.6.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- check 1.3.3-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- check 1.3.3-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- check 1.3.3-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo
   2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo
   2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- random 1.2.2-beta300.0 <- caching-compiler 2.0.0-beta300.0 <- caching-html-compiler
   2.0.0-alpha300.17 <- templating-compiler 2.0.0-alpha300.17 <- templating 1.4.4-alpha300.17 <- test-in-browser 1.4.0-beta300.0
   * meteor@2.0.0-beta300.0 <- random 1.2.2-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- autoupdate
   2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- random 1.2.2-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- tracker 1.3.3-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- retry 1.1.1-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- id-map 1.2.0-beta300.0 <- binary-heap 1.0.12-beta300.0 <- mongo 2.0.0-beta300.0 <-
   cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- id-map 1.2.0-beta300.0 <- binary-heap 1.0.12-beta300.0 <- mongo 2.0.0-beta300.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ddp-common 1.4.1-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ddp-common 1.4.1-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ddp-common 1.4.1-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- autoupdate
   2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- reload 1.3.2-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- socket-stream-client 0.5.2-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <-
   allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- socket-stream-client 0.5.2-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <-
   allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- socket-stream-client 0.5.2-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <-
   autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- diff-sequence 1.1.3-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- diff-sequence 1.1.3-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- diff-sequence 1.1.3-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- autoupdate
   2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- diff-sequence 1.1.3-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- mongo-id 1.0.9-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- mongo-id 1.0.9-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- mongo-id 1.0.9-beta300.0 <- ddp-client 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- autoupdate
   2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- mongo-id 1.0.9-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ddp-server 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo
   2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ddp-server 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo
   2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ddp-server 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- autoupdate 2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- facts-base 1.0.2-beta300.0 <- ddp-server 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- facts-base 1.0.2-beta300.0 <- ddp-server 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- allow-deny
   2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- facts-base 1.0.2-beta300.0 <- ddp-server 3.0.0-beta300.0 <- ddp 1.4.2-beta300.0 <- autoupdate
   2.0.0-beta300.0
   * meteor@2.0.0-beta300.0 <- facts-base 1.0.2-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- reactive-var 1.0.13-beta300.0 <- blaze 3.0.0-alpha300.17 <- spacebars 2.0.0-alpha300.17 <-
   templating-runtime 2.0.0-alpha300.17 <- templating 1.4.4-alpha300.17 <- test-in-browser 1.4.0-beta300.0
   * meteor@2.0.0-beta300.0 <- reactive-var 1.0.13-beta300.0 <- blaze 3.0.0-alpha300.17 <- spacebars 2.0.0-alpha300.17 <-
   test-in-browser 1.4.0-beta300.0
   * meteor@2.0.0-beta300.0 <- reactive-var 1.0.13-beta300.0 <- blaze 3.0.0-alpha300.17 <- test-in-browser 1.4.0-beta300.0
   * meteor@2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- npm-mongo 4.16.1-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- npm-mongo 4.16.1-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- minimongo 2.0.0-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- minimongo 2.0.0-beta300.0 <- allow-deny 2.0.0-beta300.0 <- mongo 2.0.0-beta300.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- minimongo 2.0.0-beta300.0 <- matb33:collection-hooks 1.3.1 <- local-test:cultofcoders:grapher
   1.5.0
   * meteor@2.0.0-beta300.0 <- geojson-utils 1.0.12-beta300.0 <- minimongo 2.0.0-beta300.0 <- allow-deny 2.0.0-beta300.0 <-
   mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- geojson-utils 1.0.12-beta300.0 <- minimongo 2.0.0-beta300.0 <- allow-deny 2.0.0-beta300.0 <-
   mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- geojson-utils 1.0.12-beta300.0 <- minimongo 2.0.0-beta300.0 <- matb33:collection-hooks 1.3.1 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- ordered-dict 1.2.0-beta300.0 <- blaze 3.0.0-alpha300.17 <- spacebars 2.0.0-alpha300.17 <-
   templating-runtime 2.0.0-alpha300.17 <- templating 1.4.4-alpha300.17 <- test-in-browser 1.4.0-beta300.0
   * meteor@2.0.0-beta300.0 <- ordered-dict 1.2.0-beta300.0 <- blaze 3.0.0-alpha300.17 <- spacebars 2.0.0-alpha300.17 <-
   test-in-browser 1.4.0-beta300.0
   * meteor@2.0.0-beta300.0 <- ordered-dict 1.2.0-beta300.0 <- blaze 3.0.0-alpha300.17 <- test-in-browser 1.4.0-beta300.0
   * meteor@2.0.0-beta300.0 <- mongo-dev-server 1.1.1-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- mongo-dev-server 1.1.1-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher
   1.5.0
   * meteor@2.0.0-beta300.0 <- binary-heap 1.0.12-beta300.0 <- mongo 2.0.0-beta300.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- binary-heap 1.0.12-beta300.0 <- mongo 2.0.0-beta300.0 <- local-test:cultofcoders:grapher 1.5.0
   * meteor@1.1.5 <- coffeescript 1.0.6 <- peerlibrary:subscription-scope 0.1.0 <- cultofcoders:grapher 1.5.0 <-
   local-test:cultofcoders:grapher 1.5.0
   * meteor@2.0.0-beta300.0 <- caching-compiler 2.0.0-beta300.0 <- caching-html-compiler 2.0.0-alpha300.17 <-
   templating-compiler 2.0.0-alpha300.17 <- templating 1.4.4-alpha300.17 <- test-in-browser 1.4.0-beta300.0
   * meteor@2.0.0-beta300.0 <- test-in-browser 1.4.0-beta300.0
   * meteor@2.0.0-beta300.0 <- tinytest 2.0.0-beta300.0 <- test-in-browser 1.4.0-beta300.0
   * meteor@2.0.0-beta300.0 <- session 1.2.2-beta300.0 <- test-in-browser 1.4.0-beta300.0
   * meteor@2.0.0-beta300.0 <- reactive-dict 1.3.2-beta300.0 <- session 1.2.2-beta300.0 <- test-in-browser 1.4.0-beta300.0
```

Fix #1: cloned into local packages and updated minimongo to Meteor v3

```bash
MONGO_URL= METEOR_PACKAGE_DIRS="../:packages" TEST_BROWSER_DRIVER=chrome meteor test-packages --once  --port 3010 ../
[[[[[ Tests ]]]]]

=> Started proxy.
=> Build failed:

   While selecting package versions:
   error: Conflict: Constraint coffeescript@2.4.1 is not satisfied by coffeescript 1.0.1.
   Constraints on package "coffeescript":
   * coffeescript@2.4.1 <- peerlibrary:subscription-scope 0.5.0 <- cultofcoders:grapher 1.5.0 <- local-test:cultofcoders:grapher
   1.5.0
   * coffeescript@2.4.1 <- peerlibrary:extend-publish 0.6.0 <- peerlibrary:subscription-scope 0.5.0 <- cultofcoders:grapher
   1.5.0 <- local-test:cultofcoders:grapher 1.5.0
```
