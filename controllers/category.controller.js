'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.model');
var Product = require('../models/products.model');
var jwt = require('../services/jwt')
var Category = require('../models/category.model');

// FUNCIONES DE ADMINISTRADOR -------> CRUD DE CATEGORIA
function createCategory(req, res){
    let category = new Category();
    let params = req.body;
    let userId = req.params.id;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permisos para realizar esta acción'});
    }else{
        if(params.passwordAdmin){
            User.findById(userId, (err, adminFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(adminFind){
                    bcrypt.compare(params.passwordAdmin, adminFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            if(params.nameCategory ==''){
                                return res.status(401).send({message:'Asegurate de haber llenado el campo'});
                            }else if(params.nameCategory){
                                Category.findOne({nameCategory: params.nameCategory}, (err, categoryFind) => {
                                    if(err){
                                        return res.status(500).send({message:'Erro general al intentar buscar categoria'});
                                    }else if(categoryFind){
                                        return res.status(404).send({message:'Nombre de categoria ya existente'});
                                    }else{
                                        category.nameCategory = params.nameCategory;
                                
                                        category.save((err, categorySaved) => {
                                            if(err){
                                                return res.status(500).send({message:'Error general al intentar guardar la categoria'});
                                            }else if(categorySaved){
                                                return res.send({message:'La categoria se ha guardado correctamente', categorySaved});
                                            }else{
                                                return res.status(401).send({message:'No se pudo guardar la categoria'});
                                            }
                                        })
                                            }
                                        })            
                            }else{
                                return res.status(500).send({message:'ingresa los campos obligatorios'});
                            }
                        }else{
                            return res.status(404).send({message:'Password incorrecta'});
                        }
                    })
                }else{
                    return res.status(404).send({message:'No se encontraron coincidencias'});
                }
            })
        }else{
            return res.status(404).send({message:'No olvides colocar la password de administrador >passwordAdmin<'});
        }
    }
}

function getCategory(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permisos para realizar esta acción'});
    }else{
        if(params.passwordAdmin){
            User.findById(userId, (err, adminFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(adminFind){
                    bcrypt.compare(params.passwordAdmin, adminFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            Category.find({}, (err, categoryFinds) => {
                                if(err){
                                    return res.status(500).send({message:'Error general al intentar buscar categorias'});
                                }else if(categoryFinds){
                                    return res.send({message:'Lista de todas las categorias', categoryFinds});
                                }else{
                                    return res.status(404).send({message:'No hay registros de categoria'});
                                }
                            }).populate('products');
                        }else{
                            return res.status(404).send({message:'Password incorrecta'});
                        }
                    })
                }else{
                    return res.status(404).send({message:'No se encontraron coincidencias'});
                }
            })
        }else{
            return res.status(404).send({message:'No olvides colocar la password de administrador >passwordAdmin<'});
        }
    }
}

function setProduct(req, res){
    var userId = req.params.id;
    var categoryId = req.params.idC;
    var params = req.body;
    var product = new Product();

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permisos para realizar esta acción'});
    }else{
        if(params.passwordAdmin){
            User.findById(userId, (err, adminFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(adminFind){
                    bcrypt.compare(params.passwordAdmin, adminFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            Category.findById(categoryId, (err, categoryFind) => {
                                if(err){
                                    return res.status(500).send({message: 'Error general'});
                                }else if(categoryFind){
                                    if(params.optionSetProduct){
                                        if(params.optionSetProduct.toLowerCase() == 'new'){
                                            if(params.nameProduct && params.stock && params.price){

                                                Product.findOne({nameProduct: params.nameProduct}, (err, productFinded) => {
                                                    if(err){
                                                        return res.status(500).send({message: 'Error general al buscar nameProduct'});
                                                    }else if(productFinded){
                                                        return res.send({message:'El producto que deseas crear ya existe, escoje la opcion de aggregate para agregar el producto ya existente'});
                                                    }else{
                                                        product.nameProduct = params.nameProduct;
                                                        product.stock = params.stock;
                                                        product.price = params.price;
                                                        product.totalSale = 0;
                                                        
                                                        product.save((err, productSaved) => {
                                                            if(err){
                                                                return res.status(500).send({message: 'Error general'});
                                                            }else if(productSaved){
                                                                Category.findByIdAndUpdate(categoryId, {$push: {products: productSaved._id}}, {new: true}, (err, categoryUpdate) => {
                                                                    if(err){
                                                                        return res.status(500).send({message: 'No se guardo el producto'});
                                                                    }else if(categoryUpdate){
                                                                        return res.send({message:'El producto fue guardado', categoryUpdate});
                                                                    }else{
                                                                        return res.status(500).send({message: 'Error al agregar producto'});
                                                                    }
                                                                }).populate('products');
                                                            }else{
                                                                return res.status(500).send({message: 'Error al agregar producto'});
                                                            }
                                                        });
                                                    }
                                                })                                               
                                            }else{
                                                return res.status(404).send({message: 'Por favor ingresa los datos minimos'});
                                            }
                                        }else if(params.optionSetProduct.toLowerCase() =='aggregate'){
                                            if(params.nameProduct){
                                                Product.findOne({nameProduct: params.nameProduct}, (err, nameProductFind) => {
                                                    if(err){
                                                        return res.status(500).send({message: 'Error general al intentar buscar nameProduct'});
                                                    }else if(nameProductFind){
                                                        Category.findByIdAndUpdate(categoryId, {$push: {products: nameProductFind._id}}, {new: true}, (err, categoryUpdate) => {
                                                            if(err){
                                                                return res.status(500).send({message: 'No se guardo el producto'});
                                                            }else if(categoryUpdate){
                                                                return res.send({message:'El producto fue guardado', categoryUpdate});
                                                            }else{
                                                                return res.status(500).send({message: 'Error al agregar producto'});
                                                            }
                                                        }).populate('products');
                                                    }else{
                                                        return res.status(500).send({message: 'Asegurate de escribir el nombre del producto correctamente o el producto aun no existe'});
                                                    }
                                                });
                                            }else{
                                                return res.send({message:'Recuerda escribir el nombre del producto'});
                                            }                                            
                                        }else{
                                            return res.status(404).send({message: 'Recuerda no dejar la opcion de seteo vacia'});
                                        }
                                    }else{
                                        return res.status(404).send({message: 'Por favor ingresa la optionSetProduct (>new or aggregate<)'});
                                    }                
                                }else{
                                    return res.status(404).send({message: 'La cateogiria que deseas agregar no existe'});
                                }
                            })
                        }else{
                            return res.status(404).send({message:'Password incorrecta'});
                        }
                    })
                }else{
                    return res.status(404).send({message:'No se encontraron coincidencias'});
                }
            })
        }else{
            return res.status(404).send({message:'No olvides colocar la password de administrador >passwordAdmin<'});
        }
    }
}

function updateCategory(req, res){
    let userId = req.params.id;
    let categoryId = req.params.idC;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permiso para realizar esta accion'})
    }else{
        if(update.passwordAdmin){
            User.findById(userId, (err, adminFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(adminFind){
                    bcrypt.compare(update.passwordAdmin, adminFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            if(update.nameCategory){
                                Category.findOne({nameCategory: update.nameCategory}, (err, categoryFind) => {
                                    if(err){
                                        return res.status(500).send({message:'Error general al intentar buscar categoria'})
                                    }else if(categoryFind){
                                        return res.status(404).send({message:'Nombre de categoria ya existente'});
                                    }else{
                                        Category.findByIdAndUpdate(categoryId, update, {new: true}, (err, categoryUpdate) => {
                                            if(err){
                                                return res.status(500).send({message:'Error al intentar actualizar'});
                                            }else if(categoryUpdate){
                                                return res.send({message:'Categoria actualizado', categoryUpdate});
                                            }else{
                                                return res.status(500).send({message:'No se puede actualizar'});
                                            }
                                        })
                                    }
                                })            
                            }else if(update.nameCategory == ''){
                                return res.status(404).send({message:'No olvides llenar los campos'});
                            }
                        }else{
                            return res.status(404).send({message:'Password incorrecta'});
                        }
                    })
                }else{
                    return res.status(404).send({message:'No se encontraron coincidencias'});
                }
            })
        }else{
            return res.status(404).send({message:'No olvides colocar la password de administrador >passwordAdmin<'});
        }
    }
}

function deleteCategory(req, res){
    let userId = req.params.id;
    let categoryId = req.params.idC;
    let categoryDefault = new Category();
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permiso para realizar esta accion'})
    }else{
        if(params.passwordAdmin){
            User.findById(userId, (err, adminFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(adminFind){
                    bcrypt.compare(params.passwordAdmin, adminFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            Category.findById(categoryId, (err, categoryFind) => {
                                if(err){
                                    return res.status(500).send({message:'Error general al intentar buscar'});
                                }else if(categoryFind){
                                    let categoryProductChange = categoryFind.products;
                                    console.log(categoryProductChange);
                    
                                    Category.findOne({nameCategory: 'Default'}, (err, defaultFind) => {
                                        if(err){
                                            return res.status(500).send({message:'Error general al intentar guardar la categoria'});
                                        }else if(defaultFind){
                                            Category.findOneAndUpdate({nameCategory: "Default"}, {$push: {products: categoryProductChange}}, {new: true}, (err, productSet) => {
                                                if(err){
                                                    return res.status(500).send({message: 'No se guardo el producto'});
                                                }else if(productSet){
                                                    Category.findByIdAndRemove(categoryId, (err, categoryRemoved) => {
                                                        if(err){
                                                            return res.status(500).send({message:'Error general al intentar eliminar la categoria'});
                                                        }else if(categoryRemoved){
                                                            return res.send({message:'Se ha eliminado la categoria'});
                                                        }else{
                                                            return res.status(500).send({message:'No se pudo eliminar la categoria'});
                                                        }
                                                    })                                        
                                                }else{
                                                    return res.status(500).send({message: 'Error al agregar producto'});
                                                }
                                            })
                                        }else{
                                            categoryDefault.nameCategory = 'Default';
                                            
                                            categoryDefault.save((err, categoryCreate) => {
                                                if(err){
                                                    return res.status(500).send({message:'Error general al intentar guardar la categoria'});
                                                }else if(categoryCreate){
                                                    Category.findOneAndUpdate({nameCategory: "Default"}, {$push: {products: categoryProductChange}}, {new: true}, (err, productSet) => {
                                                        if(err){
                                                            return res.status(500).send({message: 'No se guardo el producto'});
                                                        }else if(productSet){
                                                            Category.findByIdAndRemove(categoryId, (err, categoryRemoved) => {
                                                                if(err){
                                                                    return res.status(500).send({message:'Error general al intentar eliminar la categoria'});
                                                                }else if(categoryRemoved){
                                                                    return res.send({message:'Se ha eliminado la categoria'});
                                                                }else{
                                                                    return res.status(500).send({message:'No se pudo eliminar la categoria'});
                                                                }
                                                            })                                        
                                                        }else{
                                                            return res.status(500).send({message: 'Error al agregar producto'});
                                                        }
                                                    })
                                                }else{
                                                    return res.status(401).send({message:'No se pudo guardar la categoria'});
                                                }
                                            })
                                        }
                                    })
                                }else{
                                    return res.status(500).send({message:'No se encontro ningun dato'});
                                }
                            })
                        }else{
                            return res.status(404).send({message:'Password incorrecta'});
                        }
                    })
                }else{
                    return res.status(404).send({message:'No se encontraron coincidencias'});
                }
            })
        }else{
            return res.status(404).send({message:'No olvides colocar la password de administrador >passwordAdmin<'});
        }
    }
}

module.exports = {
    //CRUD DE CATEGORIA
    createCategory,
    getCategory,
    setProduct,
    updateCategory,
    deleteCategory
}