const express = require('express');
const router = express.Router();
const routeRoot = '/';

router.get('/admin', adminRent);

function adminRent(req, res) {
    const homePageData = {
        formInput: null,
        image: "/images/hero.jpg",
        admin: true,
        rent: true
    };

    res.render("adminRent.hbs", homePageData);
}

router.get('/items', items);

function items(req, res) {
    const homePageData = {
        formInput: null,
        image: "/images/hero.jpg",
        admin: true,
        items: true,
        forms: [{
            formName: 'Add Item',
            formInput: "/addItem",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',

            },
            {
                fieldId: 'quantity',
                fieldName: 'Quantity',

            },
            {
                fieldId: 'name',
                fieldName: 'Name',
            },
            {
                fieldId: 'description',
                fieldName: 'Description',
            },
            {
                combobox: true,
                fieldId: 'itemType',
                fieldName: 'Item Type',
            }]
        },
        {
            formName: 'Edit Item',
            formInput: "/editItem",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',

            },
            {
                fieldId: 'quantity',
                fieldName: 'Quantity',

            },
            {
                fieldId: 'name',
                fieldName: 'Name',
            },
            {
                fieldId: 'description',
                fieldName: 'Description',
            },
            {
                combobox: true,
                fieldId: 'itemType',
                fieldName: 'Item Type',
            }]
        },
        {
            formName: 'Delete Item',
            formInput: "/deleteitem",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',

            }]
        }]
    };

    res.render("form.hbs", homePageData);
}

router.get('/itemtypes', itemtypes);

function itemtypes(req, res) {
    const homePageData = {
        image: "/images/hero.jpg",
        admin: true,
        itemtypes: true,
        forms: [{
            formName: 'Add Item Type',
            formInput: "/addItemType",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',

            },
            {
                fieldId: 'name',
                fieldName: 'Name',
            }]
        },
        {
            formName: 'Edit Item Type',
            formInput: "/editItemType",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',

            },
            {
                fieldId: 'name',
                fieldName: 'Name',
            }]
        },
        {
            formName: 'Delete Item Type',
            formInput: "/deleteitemtype",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',

            }]
        }]
    };

    res.render("form.hbs", homePageData);
}

router.get('/users', users);

function users(req, res) {
    const homePageData = {
        formInput: null,
        image: "/images/hero.jpg",
        admin: true,
        users: true,
        forms: [{
            formName: 'Edit User',
            formInput: "/edituser",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',

            },
            {
                fieldId: 'username',
                fieldName: 'Username',
            },
            {
                fieldId: 'firstName',
                fieldName: 'First Name',
            },
            {
                fieldId: 'lastName',
                fieldName: 'Last Name',
            },
            {
                fieldId: 'phoneNumber',
                fieldName: 'Phone Number',
            },
            {
                fieldId: 'password',
                fieldName: 'Password',
            }]
        },
        {
            formName: 'Delete User',
            formInput: "/deleteuser",
            fields: [{
                fieldId: 'id',
                fieldName: 'Id',

            }]
        }]
    };

    res.render("form.hbs", homePageData);
}

module.exports = {
    router,
    routeRoot
}
