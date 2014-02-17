# Readable W3C Archives

The W3C keeps fantastic archives of their public email lists.
But they're painful to browse, so I made it a little easier.

## How to use it
Take any publicly archived W3C email url and swap out `lists.w3.org` for `localhost:5000`.

Scraped emails are also available in JSON format at `/m?url=[w3url]`.

## Running locally

    $ git clone https://github.com/ericfreese/w3mailparse
    $ cd w3mailparse
    $ npm install
    $ foreman start

Should run at http://localhost:5000/
