// utils/Config.js
export const CONFIG = {
  url: {
    login: 'https://uat.thecoachcompany.co.uk/admin/#!login.php',
    dashboard: 'https://uat.thecoachcompany.co.uk/admin/#!dashboard.php',
    
  },
  systemUser: {
    name: 'Fluk',
    pass: 'xxxxxxxx'
  },
  customer: {
    searchText: 'fluk company',
    name: 'fluktester',
    email: 'fluk@voovadigital.com',
    phoneHome: '02958104405',
    phoneMobile: '0958104405'
  },
  passenger: {
    name: 'boss',
    email: 'test@gmail.com',
    phone: '1234567890'
  },
  jobOption: {
    internalProfile: '206', //thecoachcompany.co.uk
    journeyType: '52', //Golf Trip
    paxCount: '12', //จำนวนผู้โดยสาร
    vehicleCount: '1', //จำนวนรถ
    vehicleType: '59', //12 Seat Standard Minibus
    bagType: '23', //No luggage.
    referralSource: '4', //Facebook
    price: '1000' //ราคาที่กรอกลงไป
    


  },
  Date: {
    dateandtime: '01 Jan 2027 08:00', 

    StartdateBooking: '10/06/2027',
    EnddateBooking: '01/01/2029'
  },
  DeleteOption: {
    delete: 'delete',
    reason: '13' //Test Delete Reason

}
};