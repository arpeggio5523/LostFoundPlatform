# Test Report

| 🕙 Start time | ⌛ Duration |
| --- | ---: |
| 9/2/2026, 3:55:50 PM | 1.968 s |

| | ✅ Passed | ❌ Failed | ⏩ Skipped | 🚧 Todo | ⚪ Total |
| --- | ---: | ---: | ---: | ---: | ---: |
|Test Suites|26|0|0|0|26|
|Tests|84|0|0|0|84|

## ✅ <a id="file0" href="#file0">tests/unit/components/FoundItems.test.jsx</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/5e451a32e83b08b4963619e2d7a898a73701fb1f/tests/unit/components/FoundItems.test.jsx)]

14 passed, 0 failed, 0 skipped, 0 todo, done in 358.69779200000016 s

```
✅ FoundItemsPage
   ✅ displays the found items list
   ✅ displays the required information for each found item
   ✅ fetches found items from the API
   ✅ displays newly fetched found items
   ✅ displays a message when no found items are available
   ✅ filters items when the user searches by title
   ✅ filters items by category
   ✅ filters items by location
   ✅ clears active filters when Clear is clicked
   ✅ navigates to the report found item page
   ✅ logs out the user and navigates to login
   ✅ redirects unauthenticated users to the login page
   ✅ displays an error message when fetching items fails
   ✅ displays loading state while items are being fetched
```

## ✅ <a id="file1" href="#file1">tests/unit/components/ItemCard.test.jsx</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/5e451a32e83b08b4963619e2d7a898a73701fb1f/tests/unit/components/ItemCard.test.jsx)]

15 passed, 0 failed, 0 skipped, 0 todo, done in 226.9358749999999 s

```
✅ ItemCard
   ✅ displays the found item name
   ✅ displays the item description
   ✅ displays the item location
   ✅ displays the date found
   ✅ displays the item category
   ✅ displays the item status
   ✅ displays the reporter name
   ✅ displays the item image when an image exists
   ✅ displays the placeholder when no image exists
   ✅ navigates to the item details page when clicked
   ✅ includes returnTo when provided
   ✅ does not display the QR modal initially
   ✅ opens the QR modal when QR icon is clicked
   ✅ does not navigate when QR icon is clicked
   ✅ closes the QR modal
```

## ✅ <a id="file2" href="#file2">tests/unit/components/ItemDetailPage.test.jsx</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/5e451a32e83b08b4963619e2d7a898a73701fb1f/tests/unit/components/ItemDetailPage.test.jsx)]

1 passed, 0 failed, 0 skipped, 0 todo, done in 15.507958000000144 s

```
✅ ItemDetailPage QR redirects
   ✅ redirects unauthenticated QR item visits to login and preserves the scanned URL
```

## ✅ <a id="file3" href="#file3">tests/unit/components/Login.test.jsx</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/5e451a32e83b08b4963619e2d7a898a73701fb1f/tests/unit/components/Login.test.jsx)]

5 passed, 0 failed, 0 skipped, 0 todo, done in 144.9202499999999 s

```
✅ Login Component
   ✅ renders email and password fields
   ✅ renders sign in button
   ✅ allows user to enter email
   ✅ allows user to enter password
   ✅ prevents submission when fields are empty
```

## ✅ <a id="file4" href="#file4">tests/unit/components/LostItems.test.jsx</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/5e451a32e83b08b4963619e2d7a898a73701fb1f/tests/unit/components/LostItems.test.jsx)]

8 passed, 0 failed, 0 skipped, 0 todo, done in 311.2058750000001 s

```
✅ LostItemsPage - Viewing and Filtering
   ✅ displays the lost items list
   ✅ displays the required information for each lost item
   ✅ fetches lost items from the API
   ✅ displays newly fetched lost items
   ✅ filters lost items when searching by title or description
   ✅ filters lost items by category
   ✅ filters lost items by location and status
   ✅ clears active filters and displays all lost items
```

## ✅ <a id="file5" href="#file5">tests/unit/components/NavBar2.test.jsx</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/5e451a32e83b08b4963619e2d7a898a73701fb1f/tests/unit/components/NavBar2.test.jsx)]

6 passed, 0 failed, 0 skipped, 0 todo, done in 151.6402089999999 s

```
✅ Navbar2 Component
   ✅ renders LostFound MY brand
   ✅ renders two navigation buttons
   ✅ calls resetTheme when logout button is clicked
   ✅ calls clearAuth when logout button is clicked
   ✅ navigates to home page after logout
   ✅ performs complete logout process
```

## ✅ <a id="file6" href="#file6">tests/unit/components/QRCodeModal.test.jsx</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/5e451a32e83b08b4963619e2d7a898a73701fb1f/tests/unit/components/QRCodeModal.test.jsx)]

5 passed, 0 failed, 0 skipped, 0 todo, done in 159.47554100000002 s

```
✅ QRCodeModal
   ✅ does not render when the modal is closed
   ✅ generates a QR code for the item detail URL
   ✅ shows a fallback when the item has no id
   ✅ copies the item URL when native sharing is unavailable
   ✅ closes when Escape is pressed
```

## ✅ <a id="file7" href="#file7">tests/unit/components/Signup.test.jsx</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/5e451a32e83b08b4963619e2d7a898a73701fb1f/tests/unit/components/Signup.test.jsx)]

19 passed, 0 failed, 0 skipped, 0 todo, done in 234.2623329999999 s

```
✅ Signup Component
   ✅ renders create account button
   ✅ allows user to enter full name
   ✅ allows user to enter email
   ✅ allows user to enter phone number
   ✅ allows user to enter occupation
   ✅ allows user to enter password
   ✅ allows user to enter confirm password
   ✅ requires full name
   ✅ requires email
   ✅ requires password
   ✅ requires confirm password
   ✅ phone number is optional
   ✅ occupation is optional
   ✅ renders sign in text
   ✅ shows error when password is shorter than 8 characters
   ✅ shows error when confirm password does not match
   ✅ shows error when password has no uppercase letter
   ✅ shows error when password has no lowercase letter
   ✅ shows error when password has no special character
```

## ✅ <a id="file8" href="#file8">tests/unit/controllers/ItemController.test.js</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/5e451a32e83b08b4963619e2d7a898a73701fb1f/tests/unit/controllers/ItemController.test.js)]

1 passed, 0 failed, 0 skipped, 0 todo, done in 6.266916999999921 s

```
✅ ItemController QR generation
   ✅ generates and stores a QR code path when creating an item
```

## ✅ <a id="file9" href="#file9">tests/unit/utils/authState.test.js</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/5e451a32e83b08b4963619e2d7a898a73701fb1f/tests/unit/utils/authState.test.js)]

9 passed, 0 failed, 0 skipped, 0 todo, done in 2.405082999999877 s

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

## ✅ <a id="file10" href="#file10">tests/unit/utils/example.test.js</a> [[link](https://git.infotech.monash.edu/fit3170_project1_2026/fit3170_project1/blob/5e451a32e83b08b4963619e2d7a898a73701fb1f/tests/unit/utils/example.test.js)]

1 passed, 0 failed, 0 skipped, 0 todo, done in 0.9054999999998472 s

```
✅ Sanity Check
   ✅ runs unit test properly
```
