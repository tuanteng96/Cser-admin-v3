export const getMember = () => {
    return window.top.DataPresent?.Items.filter(x => x.Active)[0] || {
        Member: {
            "Email": "",
            "FullName": "Huong test 20",
            "MobilePhone": "0384868559",
            "Address": "",
            "ID": 37634,
            "Money": 0,
            "Deposit": 0,
            "Photo": "",
            "Birth": "2022-01-15T00:00:00",
            "CreateDate": "2022-01-15T15:32:26",
            "DistrictID": 0,
            "ProvinceID": 0,
            "ByUserID": 0,
            "Gender": 0,
            "HomeAddress": "",
            "OwnUser": false,
            "HandCardID": "",
            "InputGroups": "",
            "GroupNames": "",
            "OrderToFn": null,
            "OrderToPay": null,
            "FixedPhone": "",
            "OrderRemainPay": 0,
            "OrderToPayed": 0,
            "IsAff": 1,
            "ByUser": "--",
            "Summary": "",
            "Source": "",
            "ByUserEnt": null,
            "TagNames": null,
        }
    }
}