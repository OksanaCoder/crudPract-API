const express = require("express")
const path = require("path")
const fs = require("fs-extra");
const uniqid = require("uniqid");
const  {join} = require("path");
const multer = require("multer");
const {check, body, validationResult} = require("express-validator");

const studentRouter = express.Router();

const studentFolderPath = path.join(__dirname, "students.json")
const studentPictureFolder = join(__dirname, "../../../public/img")
console.log(studentPictureFolder)
const upload = multer({})

studentRouter.get("/", async(req, res)=>{
   try {
       const studentDb = await fs.readJSON(studentFolderPath)
       res.send(studentDb)
       
   } catch (error) {
       res.send(error)
   }
})

studentRouter.get("/:id", async(req, res)=>{
    try {
        const studentDb = await fs.readJSON(studentFolderPath)
        
        const student = studentDb.find((s)=>s.id===req.params.id)
        
        if(student){
            res.send(student)
        }else{
            res.send("no student in db")
        }
        
    } catch (error) {
        res.send(error)
    }
    
})

studentRouter.post("/",
    [check("name").exists().isLength({min:3}), 
     check("lastname").exists().isLength({max: 7}),
     check("age").exists().isNumeric()],
     async(req, res)=>{
         const error =validationResult(req)
         if(!error.isEmpty()){
            // const error = new Error()
            // error.httpStatusCode = 400
            // error.message = errors
            res.send("please check the input")
         }else{
             
            try {
                const studentDB = await fs.readJSON(studentFolderPath)
                
                const newStudent = {...req.body, id: uniqid(), CreatedAT: new Date()}
                
                studentDB.push(newStudent)
                await fs.writeJSON(studentFolderPath, studentDB)
                
                res.status(201).send(studentDB)
            } catch (error) {
                res.send(error)
            }
             
         }
    
   
})

studentRouter.put("/:id", async(req, res)=>{
    try {
        const studentDB = await fs.readJSON(studentFolderPath)
        
        const filteredStudent = studentDB.find((d)=>d.id === req.params.id)
        
        if(filteredStudent){
            
            const position = studentDB.indexOf(filteredStudent);
            
            const updatedStudent = {...filteredStudent, ...req.body}
            studentDB[position] = updatedStudent
            
            await fs.writeJSON(studentFolderPath, studentDB )
            res.status(200).send("updatedStudent")
        }else{
            res.send("wrong id")
        }
        
    } catch (error) {
        res.send(error)
    }
})


studentRouter.post("/upload", upload.single("Oksana"), async(req, res, next)=>{
    console.log(req.file)
    try {
        await fs.writeFile(
            join(studentPictureFolder, req.file.originalname),
            req.file.buffer
        )
      // console.log(req.file.originalname)
     
    } catch (error) {
        console.log(error)
    }
    res.send("file uploaded")  
    
})
studentRouter.get("/:name/download", async( req, res)=>{
    const source = fs.createReadStream(join(studentPictureFolder, `${req.params.name}`))
    res.setHeader('Content-Disposition', `attachment; filename=${req.params.name}`)
    source.pipe(res)
    
    res.send(`${req.params.name}`)
})
studentRouter.post("/Multiples", upload.array("Oksanaes"), async(req, res, next)=>{
    console.log(req.file)
    try {
        // await fs.writeFile(
        //     join(studentPictureFolder, req.file.originalname),
        //     req.file.buffer
        // )
        const files =req.files.map(file=> 
             fs.writeFile(join(studentPictureFolder, file.originalname), 
                          file.buffer))
        await Promise.all(files)
      // console.log(req.file.originalname)
     
    } catch (error) {
        console.log(error)
    }
    res.send("file uploaded")
})
studentRouter.delete("/:id", async(req, res)=>{
    try {
        const studentDb = await fs.readJSON(studentFolderPath)
        const deletedStudent = studentDb.find(d=> d.id===req.params.id)
        
        if(deletedStudent){
            
            await fs.writeJSON(studentFolderPath, studentDb.filter(x => x.id !==req.params.id) )
            
            res.send("deleted")
        }else{
            res.send("wrong Id")
        }
        
        
        
    } catch (error) {
        res.send(error)
    }
    
})



module.exports = studentRouter;