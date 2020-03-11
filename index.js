const fs = require('fs');
const path = require('path');
const csv_to_json = require('csvtojson');
const { parse } = require('json2csv');

const default_file_name = 'Zoho Contacts.csv';
const csv_file_path =
    process.argv.find((arg) => {
        return /\.csv/.test(arg);
    }) || path.join(__dirname, default_file_name);

// https://emailregex.com/
const email_regex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi;
// https://phoneregex.com/
const telephone_regexes = [
    // International:
    /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/gi,
    // UK:
    /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/gi,
    // US:
    /1?\W*([2-9][0-8][0-9])\W*([2-9][0-9]{2})\W*([0-9]{4})(\se?x?t?(\d*))?/gi,
    // Canada:
    /^(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/
];

const export_new_csv = (data) => {
    return fs.writeFile(
        path.join(__dirname, `NEW__${default_file_name}`),
        data,
        (err) => {
            if (err) {
                console.error('Something failed:', err);
            } else {
                console.log('It worked!');
            }
        }
    );
};

const phone_number_normalize = (phone_number) => {
    return phone_number.replace(/[^\d]/g, '').trim();
    // if (phone_number.replace(/[^\d]/g, '').length !== 10) {
    //     console.log(phone_number);
    //     return phone_number;
    // } else {
    //     return phone_number
    //         .replace(/[^\d]/g, '')
    //         .replace(/(\d{3})(\d{3})(\d{4})/, '$1.$2.$3');
    // }
};

const parse_notes_field = (json_data) => {
    const new_data = json_data.map((row) => {
        if (row.Notes) {
            let emails = row.Notes.match(email_regex);
            if (emails && emails.length) {
                row.Email += `;${emails.join(';')}`;
            }

            let phone_numbers = telephone_regexes
                .map((telephone_regex) => {
                    return row.Notes.match(telephone_regex);
                })
                .filter(Boolean);
            if (phone_numbers && phone_numbers.length) {
                row.Mobile += `;${phone_numbers
                    .map((phone_number) => {
                        if (Array.isArray(phone_number)) {
                            return phone_number
                                .map((nested_number) => {
                                    return phone_number_normalize(
                                        nested_number
                                    );
                                })
                                .join(';');
                        } else {
                            return phone_number_normalize(phone_number);
                        }
                    })
                    .join(';')}`;
            }
        }
        return row;
    });
    const csv = parse(new_data);
    // console.log(csv);

    return export_new_csv(csv);
};

const read_file = () => {
    return csv_to_json()
        .fromFile(csv_file_path)
        .then((json_data) => {
            // console.log(json_data);
            parse_notes_field(json_data);
        });
};

const do_it = () => {
    read_file();
};

do_it();
