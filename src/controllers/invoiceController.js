const QueryHelper = require("../utils/QueryHelper");
const Invoice = require("../models/Invoice");
const Booking = require("../models/Booking");
const mongoose = require("mongoose");
/**
 * @API_endpoint example :POST http://localhost:4000/api/invoices
 * @param {req.body = bookingId} req.body = bookingId
 * @return {success status, data(invoice created)}
 * @required receptionist,manager,admin
 */
const checkoutInvoice = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(404).json({
        success: false,
        error: "BookingId is required",
      });
    }
    const existingBooking = await Booking.findById(bookingId).session(session);
    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }
    if (!["confirmed", "pending"].includes(existingBooking.status)) {
      return res.status(404).json({
        success: false,
        error: "Booking already processed",
      });
    }

    session.startTransaction();

    existingBooking.status = "completed";
    await existingBooking.save({ session });

    const invoice = new Invoice({
      bookingId: bookingId,
      totalAmount: existingBooking.totalAmount,
    });
    await invoice.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populatedInvoice = await invoice.populate({
      path: "bookingId",
      select: "customerIds userId bookingDetails",
      populate: [
        {
          path: "customerIds",
          select: "fullName idNumber phone address",
        },
        {
          path: "userId",
          select: "fullName phone role",
        },
        {
          path: "bookingDetails",
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: populatedInvoice,
    });
  } catch (err) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();

    console.error("Transaction failed:", err);

    return res.status(500).json({
      success: false,
      error: "Transaction failed",
    });
  }
};

/**
 * @api_endpoint example :GET http://localhost:4000/api/invoices
 * @param {page, limit, search}
 * @returns {success status, total page, count, data}
 * @required receptionist,manager,admin
 */
const getAllInvoices = async (req, res) => {
  try {
    const { sort, search, page = 1, limit = 10 } = req.query;

    const searchRegex = new RegExp(search, "i");

    const skip = (page - 1) * limit;

    const allInvoices = await Invoice.find({})
      .populate({
        path: "bookingId",
        select: "customerIds userId bookingDetails ",
        populate: [
          {
            path: "customerIds",
            select: "fullName idNumber phone address -_id",
          },
          {
            path: "userId",
            select: "fullName phone -_id",
          },
          {
            path: "bookingDetails",
            select:
              "roomId numberOfGuests checkInDate checkOutDate roomPrice additionalFees totalPrice",
            populate: [
              {
                path: "roomId",
                select: "-_id roomName",
              },
              {
                path: "additionalFees",
                select: "-_id amount description",
              },
            ],
          },
        ],
      })
      .sort(sort || "createdAt")
      .exec();

    const filteredInvoices = allInvoices.filter((invoice) => {
      return (
        invoice.bookingId &&
        (invoice.bookingId.customerIds?.some(
          (customer) =>
            searchRegex.test(customer.fullName) ||
            searchRegex.test(customer.phone)
        ) ||
          (invoice.userId &&
            (searchRegex.test(invoice.userId.fullName) ||
              searchRegex.test(invoice.userId.phone))) ||
          invoice.bookingId.bookingDetails?.some(
            (detail) =>
              detail.roomId && searchRegex.test(detail.roomId.roomName)
          ))
      );
    });

    const paginatedInvoices = filteredInvoices.slice(
      skip,
      skip + parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: paginatedInvoices,
      total: filteredInvoices.length,
      count: paginatedInvoices.length,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bookings",
    });
  }
};

module.exports = { checkoutInvoice, getAllInvoices };
