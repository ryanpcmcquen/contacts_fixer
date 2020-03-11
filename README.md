## contacts_fixer

Do you have a bunch of data in the wrong field for your Contacts?

This script will parse your Contacts CSV (it expects a Zoho
Contacts CSV export, but can be modified for other
services) and will export a new CSV with the
`Email` and `Mobile` fields filled in with
all emails and phone numbers found in
the `Notes` field. It can easily be
modified to parse data from other
fields as well.

### Usage:

```
npm install && npm start
```

It will create a new version of your original CSV with `NEW__` as a prefix.
