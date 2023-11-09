const router = require("express").Router();
const Clinics = require("../schemas/clinics.js");
const assertAdmin = require("../utilities/assertAuthority.js");

/**
 * Get /clinics
 * @summary Returns all clinics
 * @return {object} Successful Response: 200
 * @return {object} Clinics not found: 404
 */
router.get("/", async function(req, res){
    const clinics = await Clinics.find().select("-__v");
    if (clinics.length === 0) {
        return res.status(404).json({
            message: "No clinics are registered to the system!!"
        })
    }
    return res.status(200).send(clinics);
})

/**
 * Get /clinics/{id}
 * @summary Returns a certain clinic by id
 * @return {object} Successful Response: 200
 * @return {object} Clinic not found: 404
 */
router.get("/:id", async function(req, res){
    const clinic = await Clinics.findOne({ id: req.params._id }).select("-__v");
    if (!clinic._id) {
        return res.status(404).json({
            message: "The following clinic does not exist."
        })
    }
    return res.status(200).send(clinic);
})

/**
 * Post /clinics
 * @summary Creates a new clinic
 * @return {object} Successful Request (Clinic created): 201
 * @return {object} Bad Request Response: 400
 */
router.post("/", assertAdmin, function(req, res){
    const newClinic = new Clinic({
        clinicName: req.body.clinicName,
        address: req.body.address
    })
    console.log(newClinic)
    newClinic.save() 
    .then((err) => {
        if (err) {
            return res.status(400).json({
                title: "Error",
                message: "A clinic with the same addreess already exists!!"
            })
        }
        return res.status(201).json({
            message: "Clinic successfully created :)"
        })
    })
})

/**
 * Delete /clinics/{id}
 * @summary Delete a certain clinic by using id
 * @return {object} Successful response: 204
 * @return {object} Not Authorized (Not logged in): 401
 * @return {object} No permission to delete the account: 403
 * @return {object} Clinic with the id does not exist: 404
 */
router.delete("/:id", assertAdmin, async function(req, res){
    const clinic = await Clinics.findOne({ id: params.Clinic._id }).select("-__v");
    await clinic.deleteOne();
    if (!clinic) {
        return res.status(404).json({
            message: "User does not exist!!"
        })
    }
    return res.status(204).send(clinic);
})

/**
 * Delete /clinics
 * @summary Delete every clinics
 * @return {object} Successful response: 200
 * @return {object} Not authorized: 403
 */
router.delete("/", assertAdmin, async function(req, res){
    const clinics = Clinics.find().select("-__v -clinicName")
    await Clinics.deleteMany();
    return res.status(204).send(clinics);
})

module.exports = router;