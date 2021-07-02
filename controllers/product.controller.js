'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.model');
var Product = require('../models/products.model');
var jwt = require('../services/jwt')
var Category = require('../models/category.model');

// FUNCIONES DE ADMINISTRADOR ------> CRUD DE PRODUCTOS
function creatProduct(req, res){
    let product = new Product();
    let params = req.body;
    let userId = req.params.id;

    if(userId != req.user.sub){
        return res.status(404).send({message:'No tienes permiso para actualizar esta cuenta'});
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
                            if(params.nameProduct && params.stock && params.price){
                                Product.findOne({nameProduct: params.nameProduct}, (err, productFind) => {
                                    if(err){
                                        return res.status(500).send({message:'Error general al intentar buscar nameProduct'});
                                    }else if(productFind){
                                        return res.status(404).send({message:'Este producto ya existe, recomendamos que actualices el producto ya existente'});
                                    }else{
                                        product.nameProduct = params.nameProduct;
                                        product.stock = params.stock;
                                        product.price = params.price;
                                        product.totalSale = 0;
                        
                                        product.save((err, productSaved) => {
                                            if(err){
                                                return res.status(500).send({message:'Error al intentar guardar'});
                                            }else if(productSaved){
                                                return res.send({message:'Producto guardado', productSaved});
                                            }else{
                                                return res.status(401).send({message:'No se guardo el producto'});
                                            }
                                        })
                                    }
                                })
                            }else{
                                return res.status(404).send({message:'Por favor ingresa los datos obligatorios'});
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

function getProducts(req, res){
    let params = req.body;
    let userId = req.params.id;

    if(userId != req.user.sub){
        return res.status(404).send({message:'No tienes permisos para realizar esta acción'});
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
                            if(params.optionFind){
                                if(params.optionFind.toLowerCase() == 'one'){
                                    if(params.nameProduct){
                                        Product.findOne({nameProduct: params.nameProduct}, (err, productFind) => {
                                            if(err){
                                                return res.status(500).send({message:'Error general al intentar buscar producto'});
                                            }else if(productFind){
                                                return res.send({message:'Producto encontrado', productFind});
                                            }else{
                                                return res.status(404).send({message:'No se encontraron coincidencias o el producto no existe'});
                                            }
                                        })
                                    }else{
                                        return res.status(404).send({message:'No olvides ingresar el nameProduct que deseas buscar'});
                                    }
                                }else if(params.optionFind.toLowerCase() == 'all'){
                                    Product.find({}, (err, productsFind) => {
                                        if(err){
                                            return res.status(500).send({message:'Error general al intentar buscar productos'});
                                        }else if(productsFind){
                                            return res.send({message:'Productos encontrados', productsFind});
                                        }else{
                                            return res.status(404).send({message:'Aun no hay productos'});
                                        }
                                    })
                                }else{
                                    return res.status(404).send({message:'Las opciones de busqueda son: One y All'});
                                }
                            }else if(params.optionFind == ''){
                                return res.status(404).send({message:'Por favor no dejes vacio este campo'});
                            }else{
                                return res.send({message:'Ingresa la opcion de busqueda(optionFind: >one o all<)'});
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

function updateProduct(req, res){
    let userId = req.params.idU
    let productId = req.params.idP;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permisos para realizar esta acción'});
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
                            if(update.stock){
                                Product.findOne({_id:productId}, (err, productFind) => {
                                    if(err){
                                        return res.status(500).send({message:'Error general al intentar buscar producto'});
                                    }else if(productFind){
                                        Product.findOne({nameProduct: update.nameProduct}, (err, nameProFind) => {
                                            if(err){
                                                return res.status(500).send({message:'Error general al buscar nameProduct'});
                                            }else if(nameProFind){
                                                return res.send({message:'No puedes actualizar a un nombre de producto ya existente'});
                                            }else{
                                                Product.findByIdAndUpdate(productId, update, {new: true}, (err, productUpdate) => {
                                                    if(err){
                                                        return res.status(500).send({message:'Error en la actualizacion'});
                                                    }else if(productUpdate){
                                                        return res.status(200).send({message:'Producto actualizado', productUpdate});
                                                    }else{
                                                        return res.status(404).send({message:'Producto no actualizado'});
                                                    }
                                                })
                                            }
                                        })                                        
                                    }else{
                                        return res.status(404).send({message:'No se encontro el producto buscado'});
                                    }
                                })
                            }else{
                                return res.status(404).send({message:'Por favor ingresa los datos minimos'});
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

function deleteProduct(req, res){
    let userId = req.params.id;
    let productId = req.params.idP;
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
                            Product.findById(productId, (err, productFind) => {
                                if(err){
                                    return res.status(500).send({message:'Error general al intetar eliminar producto'});     
                                }else if(productFind){
                                    Category.findOneAndUpdate({products: productFind._id},
                                        {$pull: {products: productId}}, {new: true}, (err, categoryFind) => {
                                        if(err){
                                            return res.status(500).send({message:'Error general al intetar eliminar producto de categoria'});
                                        }else if(categoryFind){
                                            Product.findByIdAndRemove(productId, (err, productDelete) => {
                                                if(err){
                                                    return res.status(500).send({message:'Error general al intetar eliminar producto'});
                                                }else if(productDelete){
                                                    return res.send({message:'Producto eliminado'});
                                                }else{
                                                    return res.status(500).send({message:'Producto no encontrado o ya eliminado'});
                                                }
                                            })
                                        }else{
                                            Product.findByIdAndRemove(productId, (err, productDelete) => {
                                                if(err){
                                                    return res.status(500).send({message:'Error general al intetar eliminar producto'});
                                                }else if(productDelete){
                                                    return res.send({message:'Producto eliminado'});
                                                }else{
                                                    return res.status(500).send({message:'Producto no encontrado o ya eliminado'});
                                                }
                                            })
                                        }
                                        })
                                }else{
                                    return res.status(401).send({message:'El producto no encontrado o ya fue eliminado'});
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
//######################################################

module.exports = {
    //CRUD DE PRODUCTOS
    creatProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    //##################
}