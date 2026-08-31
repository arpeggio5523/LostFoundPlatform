# Test Report

| 🕙 Start time | ⌛ Duration |
| --- | ---: |
| 30/08/2026, 4:19:30 pm | 3.029 s |

| | ✅ Passed | ❌ Failed | ⏩ Skipped | 🚧 Todo | ⚪ Total |
| --- | ---: | ---: | ---: | ---: | ---: |
|Test Suites|6|0|0|0|6|
|Tests|9|0|0|0|9|

## ✅ <a id="file0" href="#file0">tests\unit\utils\authState.test.js</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/1bb3463025270ee200e96d97127d005d292cbbcf/tests\unit\utils\authState.test.js)]

9 passed, 0 failed, 0 skipped, 0 todo, done in 12.005999999999858 s

```
✅ authState › setAuthUser and getToken
   ✅ stores token in localStorage
   ✅ does not store token when token is not provided
✅ authState › setAuthUser and getAuthUser
   ✅ stores and retrieves user correctly
   ✅ returns null when no user is stored
   ✅ returns null when stored user data is invalid JSON
✅ authState › getCurrentUserId
   ✅ returns user id when id exists
   ✅ returns _id when id does not exist
   ✅ returns null when no user exists
✅ authState › clearAuth
   ✅ removes token and user from localStorage
✅ authState
```
