const fs = require('fs')
const path = require('path')
const RoomType = require('../models/RoomType')
const Room = require('../models/Room')
const CustomerType = require('../models/CustomerType')
const mockRoomTypeAndRoomData = async ()=>{
    try{

        if(await RoomType.countDocuments() == 0)
        {
            const data = fs.readFileSync(path.join(__dirname, './json/roomType.json'), 'utf-8')
            const roomTypes = JSON.parse(data)
            for(const rt of roomTypes)
            {
                await RoomType.create({
                    name : rt.name,
                    maxOccupancy : rt.maxOccupancy,
                    surchargeRate : rt.surchargeRate,
                    price : rt.price
                })
            }
            console.log('Mock roomtype data successfully')
        }
        
        if(await Room.countDocuments() == 0)
        {
            const data = fs.readFileSync(path.join(__dirname,'./json/room.json'),'utf-8')
            const rooms = JSON.parse(data)
            const roomTypes = await RoomType.find()
            const roomTypeLength = roomTypes.length 
        
            for(let j = 0 ; j<rooms.length ; j++)
                {
                    const mod = j%roomTypeLength 
                    await Room.create({
                        roomTypeId : roomTypes[mod],
                        roomName : rooms[j].roomName,
                    })
                }
            console.log('Mock room data successfully')
        }

    }catch(error)
    {
        console.error('Unable to mock RoomType and Room data : ',error)
    }
}

const mockCustomerTypeData = async()=>{
    try{

        if(await CustomerType.countDocuments() == 0)
        {
            const data = fs.readFileSync(path.join(__dirname, './json/customerType.json'), 'utf-8')
            const customerTypes = JSON.parse(data)
            for(const ct of customerTypes)
            {
                await CustomerType.create({
                    name : ct.name,
                    coefficient : ct.coefficient
                })
            }
            console.log('Mock customerType data successfully')
        }
        
        

    }catch(error)
    {
        console.error('Unable to mock customerType :',error)
    }
}

module.exports = {mockRoomTypeAndRoomData,mockCustomerTypeData}

