'use strict'

var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.model');
var Product = require('../models/products.model');
var jwt = require('../services/jwt')
var Category = require('../models/category.model');
var ShoppingCart = require('../models/shoppingCart.model');
var Bills = require('../models/bill.model');
var RepositoryShoppingCart = require('../models/repositoryShoppingCart.model');
var moment = require('moment');

function creatInit(req, res){
    let user = new User();

    user.rol = 'ROL_ADMIN';
    user.password = "12345";
    user.username = "admin";
    user.totalShoppingCart = 0;
    user.totaldestock = 0;

    User.findOne({username: user.username}, (err, usernameFind) => {
        if(err){
            console.log('Error al crear al admin')
        }else if(usernameFind){
            console.log('administrador ya creado');
        }else{
            bcrypt.hash(user.password, null, null, (err, passwordHash) => {
                if(err){
                    console.log('Error al intentar encriptar');
                }else if(passwordHash){
                    user.password = passwordHash;
                    user.save((err, userSaved) => {
                        if(err){
                            console.log('Error al crear el admin');
                        }else if(userSaved){
                            console.log('Usuario administrador creado');
                        }else{
                            console.log('Usuario administrador no creado');
                        }
                    })                    
                }else{
                    console.log('No se pudo encriptar');
                }
            })
        }
    })
}

//FUNCTIONES DE ADMINISTRADOR

function saveUser(req, res){
    let userId = req.params.id;
    let user = new User();
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
                            if(params.name && params.username && params.lastname && params.password && params.rol){
                                User.findOne({username: params.username}, (err, usernameExist) => {
                                    if(err){
                                        return res.status(500).send({message:'Error general al buscar username'});
                                    }else if(usernameExist){
                                        return res.status(404).send({message:'Nombre de usuario ya existente'});
                                    }else{
                                        if(params.rol =='ROL_ADMIN' || params.rol == 'ROL_CLIENTE'){
                                            bcrypt.hash(params.password, null, null, (err, hashPassword) => {
                                                if(err){
                                                    return res.status(500).send({message:'Error general al intetar encriptar'});
                                                }else if(hashPassword){
                                                    user.password = hashPassword;
                                                    user.name = params.name;
                                                    user.lastname = params.lastname;
                                                    user.username = params.username;
                                                    user.rol = params.rol;
                                                    user.totalShoppingCart = 0;
                                                    user.totaldestock = 0;
                    
                                                    user.save((err, userSaved) => {
                                                        if(err){
                                                            return res.status(500).send({message:'Error general al intentar guardar usuario'});
                                                        }else if(userSaved){
                                                            return res.send({message:'Usuario guardado', userSaved});
                                                        }else{
                                                            return res.status(404).send({message:'Usuario no guardado'});
                                                        }
                                                    })
                                                }else{
                                                    return res.status(404).send({message:'Password no encriptada'});
                                                }
                                            })
                                        }else{
                                            return res.status(404).send({message:'El rol debe colocarse como >ROL_ADMIN o ROL_CLIENTE<'});
                                        }
                                    }
                                })  
                            }else{
                                return res.status(404).send({message:'Por favor ingresa todos los parametros obligatorios'}); 
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

function updateUser(req, res){
    let userId = req.params.id;
    let clienteId = req.params.idC;
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
                            User.findById(clienteId, (err, clientFind) => {
                                if(err){
                                    return res.status(500).send({message:'Error general al buscar idUser'});
                                }else if(clientFind){
                                    if(clientFind.rol == "ROL_CLIENTE"){
                                        if(update.password || update.password == ''){
                                            return res.status(404).send({message:'No puedes actualizar la password del usuario'});   
                                        }else if(update.rol){
                                            return res.status(404).send({message:'No puedes actualizar el rol de un cliente'}); 
                                        }else if(update.username){
                                            User.findOne({username: update.username.toLowerCase()}, (err, userFind) => {
                                                if(err){
                                                    return res.status(500).send({message:'Error general al buscar por update.username'}); 
                                                }else if(userFind){
                                                    return res.status(404).send({message:'Nombre de usuario ya existente, elija otro'}); 
                                                }else{
                                                    User.findByIdAndUpdate(clienteId, update, {new: true}, (err, updateUser) => {
                                                        if(err){
                                                            return res.status(500).send({message:'Error general al actualizar usuario'}); 
                                                        }else if(updateUser){
                                                            return res.send({message:'Usuario actualizado', updateUser});
                                                        }else{
                                                            return res.status(404).send({message:'No se ha actualizado el usuario'}); 
                                                        }
                                                    })
                                                }
                                            })
                                        }else{
                                            User.findByIdAndUpdate(clienteId, update, {new: true}, (err, updateUser) => {
                                                if(err){
                                                    return res.status(500).send({message:'Error general al actualizar usuario'}); 
                                                }else if(updateUser){
                                                    return res.send({message:'Usuario actualizado', updateUser});
                                                }else{
                                                    return res.status(404).send({message:'No se ha actualizado el usuario'}); 
                                                }
                                            })
                                        }
                                    }else{
                                        return res.status(404).send({message:'No puedes actualizar el usuario de un administrador'}); 
                                    }
                                }else{
                                    return res.status(404).send({message:'No se encontro coincidencia o el id no existe'});
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

function removeClient(req, res){
    let userId = req.params.id;
    let clientId = req.params.idC;
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
                            User.findById(clientId, (err, clientFind) => {
                                if(err){
                                    return res.status(500).send({message:'Error general al buscar idUser'});
                                }else if(clientFind){
                                    if(clientFind.rol == "ROL_CLIENTE"){
                                        User.findByIdAndRemove(clientId, (err, userRemoved) => {
                                            if(err){
                                                return res.status(500).send({message:'Error general al eliminar'}); 
                                            }else if(userRemoved){
                                                return res.send({message:'Se ha eliminado el cliente correctamente'});
                                            }else{
                                                return res.status(404).send({message:'No se ha podido eliminar'}); 
                                            }
                                        })
                                    }else{
                                        return res.status(404).send({message:'No puedes actualizar el usuario de un administrador'}); 
                                    }
                                }else{
                                    return res.status(404).send({message:'No se encontro coincidencia o el id no existe'});
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
// ---------------------------------- // 

// FUNCIONES DE CLIENTE
function saveClient(req, res){
    let params = req.body;
    let user = new User();

    if(params.name && params.username && params.lastname && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, usernameExist) => {
            if(err){
                return res.status(500).send({message:'Error general al buscar username'});
            }else if(usernameExist){
                return res.status(404).send({message:'Nombre de usuario ya existente'});
            }else{                
                bcrypt.hash(params.password, null, null, (err, hashPassword) => {
                    if(err){
                        return res.status(500).send({message:'Error general al intetar encriptar'});
                    }else if(hashPassword){
                        user.password = hashPassword;
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.username = params.username.toLowerCase();
                        user.rol = "ROL_CLIENTE";
                        user.totalShoppingCart = 0;
                        user.totaldestock = 0;

                        user.save((err, userSaved) => {
                            if(err){
                                return res.status(500).send({message:'Error general al intentar guardar usuario'});
                            }else if(userSaved){
                                return res.send({message:'Usuario guardado', userSaved});
                            }else{
                                return res.status(404).send({message:'Usuario no guardado'});
                            }
                        })
                    }else{
                        return res.status(404).send({message:'Password no encriptada'});
                    }
                })                
            }
        })  
    }else{
        return res.status(404).send({message:'Por favor ingresa todos los parametros obligatorios'}); 
    }
}

function listProducts(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permiso para realizar esta acción'});
    }else{
        if(params.password){
            User.findById(userId, (err, adminFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(adminFind){
                    bcrypt.compare(params.password, adminFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            Product.find({}, (err, productFind) => {
                                if(err){
                                    return res.status(500).send({message:'Error general al intentar buscar productos'});
                                }else if(productFind){
                                    return res.send({message:'Catálogo de productos más vendidos', productFind});
                                }else{
                                    return res.status(404).send({message:'No se encontro ningun producto'});
                                }
                            }).sort({totalSale:-1});
                        }else{
                            return res.status(404).send({message:'Password incorrecta'});
                        }
                    })
                }else{
                    return res.status(404).send({message:'No se encontraron coincidencias'});
                }
            })
        }else{
            return res.status(404).send({message:'No olvides colocar tu password para acceder >password<'});
        }
    }
}

function searchProduct(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permiso para realizar esta acción'});
    }else{
        if(params.password){
            User.findById(userId, (err, adminFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(adminFind){
                    bcrypt.compare(params.password, adminFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            if(params.search){
                                Product.findOne({nameProduct: params.search}, (err, productFind) => {
                                    if(err){
                                        return res.status(500).send({message:'Error general al intentar buscar nombre de producto'});
                                    }else if(productFind){
                                        return res.send({message:'Se encontro el producto', productFind})
                                    }else{
                                        return res.status(404).send({message:'No se encontraron resultados'});
                                    }
                                })
                            }else{
                                return res.status(404).send({message:'No olvides colocar el nombre del producto que buscas >search<'});
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
            return res.status(404).send({message:'No olvides colocar tu password para acceder >password<'});
        }
    }
}

function getCategoryProduct(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permisos para realizar esta acción'});
    }else{
        if(params.password){
            User.findById(userId, (err, adminFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(adminFind){
                    bcrypt.compare(params.password, adminFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            if(params.optionFind){
                                if(params.optionFind.toLowerCase() == 'one'){  
                                    if(params.nameCategory){
                                        Category.find({nameCategory: params.nameCategory}, (err, categoryFinds) => {
                                            if(err){
                                                return res.status(500).send({message:'Error general al intentar buscar categorias'});
                                            }else if(categoryFinds != ''){
                                                return res.send({message:'Lista de categorias que buscas', categoryFinds});
                                            }else{
                                                return res.status(404).send({message:'No hay registros de categoria'});
                                            }
                                        }).populate('products');
                                    }else{
                                        return res.status(404).send({message:'No olvides colocar el nombre de la categoria >nameCategory<'});
                                    }                                
                                }else if(params.optionFind.toLowerCase() == 'all'){                                
                                    Category.find({}, (err, categoryFinds) => {
                                        if(err){
                                            return res.status(500).send({message:'Error general al intentar buscar categorias'});
                                        }else if(categoryFinds != ''){
                                            return res.send({message:'Lista de todas las categorias', categoryFinds});
                                        }else{
                                            return res.status(404).send({message:'No hay registros de categoria'});
                                        }
                                    }).populate('products');
                                }else{
                                    return res.status(404).send({message:'No olvides colocar la optionFind >all o one<'});
                                }
                            }else{
                                return res.status(401).send({message:'No olvides colocar la optionFind >one o all<'})
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
            return res.status(404).send({message:'No olvides colocar tu password para acceder >password<'});
        }
    }
}

function removedUser(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permiso para realizar esta acción'});
    }else{
        if(params.password){
            User.findById(userId, (err, clienteFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(clienteFind){
                    bcrypt.compare(params.password, clienteFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            User.findByIdAndRemove(userId, (err, clienteRemoved) => {
                                if(err){
                                    return res.status(500).send({message:'Error general al intentar eliminar cliente'});
                                }else if(clienteRemoved){
                                    ShoppingCart.remove({propietario: clienteFind.username}, (err, carritoRemoved) => {
                                        if(err){
                                            return res.status(500).send({message:'Error general al intentar eliminar'});
                                        }else if(carritoRemoved){
                                            Bills.remove({propietario: clienteFind.username}, (err, propietarioFind) => {
                                                if(err){
                                                    return res.status(500).send({message:'Error general al intentar eliminar bills'});
                                                }else if(propietarioFind){
                                                    return res.send({message:'Se ha eliminado tu cuenta de manera correcta'});
                                                }else{
                                                    return res.status(401).send({message:'No se pudo eliminar tu usuario'});
                                                }
                                            })
                                        }else{
                                            return res.status(401).send({message:'Error al intentar eliminar'});
                                        }
                                    })
                                }else{
                                    return res.status(401).send({message:'No hay coincidencias, no se pudo eliminar'});
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
            return res.status(401).send({message:'No olvides escribir tu password'});
        }
    }
}

function updateClient(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permiso para realizar esta acción'});
    }else{
        if(params.passwordClient){
            User.findById(userId, (err, clienteFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(clienteFind){
                    bcrypt.compare(params.passwordClient, clienteFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            if(params.password){
                                return res.send({message:'Esta funcion no permite actualizacion de password'});
                            }else{
                                if(params.username){
                                    User.findOne({username: params.username}, (err, usernameFind) => {
                                        if(err){
                                            return res.status(500).send({message:'Error general al intetar buscar username'});
                                        }else if(usernameFind){
                                            return res.send({message:'Nombre de usuario ya existente, utiliza otro'});
                                        }else{
                                            if(params.rol){
                                                return res.status(401).send({message:'Esta funcion no permite actualizacion de rol'});
                                            }else{
                                                if(params.totalShoppingCart){
                                                    return res.status(401).send({message:'Esta funcion no permite actualizacion del total en el carrito'});
                                                }else{
                                                    User.findByIdAndUpdate(userId, params, {new: true}, (err, userUpdate) => {
                                                        if(err){
                                                            return res.status(500).send({message:'Error general al intetar actualizar'});
                                                        }else if(userUpdate){
                                                            return res.send({message:'Actualizado correctamente', userUpdate});
                                                        }else{
                                                            return res.status(500).send({message:'No hay datos para actualizar'});
                                                        }
                                                    })
                                                }
                                            }                                            
                                        }
                                    })
                                }else{
                                    if(params.rol){
                                        return res.status(401).send({message:'Esta funcion no permite actualizacion de rol'});
                                    }else{
                                        if(params.totalShoppingCart){
                                            return res.status(401).send({message:'Esta funcion no permite actualizacion del total en el carrito'});
                                        }else{
                                            User.findByIdAndUpdate(userId, params, {new: true}, (err, userUpdate) => {
                                                if(err){
                                                    return res.status(500).send({message:'Error general al intetar actualizar'});
                                                }else if(userUpdate){
                                                    return res.send({message:'Actualizado correctamente', userUpdate});
                                                }else{
                                                    return res.status(500).send({message:'No se pudo actualizar'});
                                                }
                                            })
                                        }
                                    }
                                }
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
            return res.status(401).send({message:'No olvides escribir tu password >passwordClient<'});
        }
    }
}
// FUNCION PARA LOGEAR TANTO CLIENTE COMO ADMINISTRADOR

function loginUser(req, res){
    let params = req.body;
    
    if(params.username && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, usernameFind) => {
            if(err){
                return res.status(500).send({message:'Error general al intentar buscar username'});
            }else if(usernameFind){
                bcrypt.compare(params.password, usernameFind.password, (err, equalsPassword) => {
                    if(err){
                        return res.status(500).send({message:'Error al comparar contraseñas'});
                    }else if(equalsPassword){
                        if(params.gettoken){                            
                            Bills.find({propietario: params.username}, (err, billsFind) => {
                                if(err){
                                    return res.status(500).send({message:'Error general al intentar buscar bills'});
                                }else if(billsFind){
                                    ShoppingCart.find({propietario: params.username}, (err, shopingFind) => {
                                        if(err){
                                            return res.status(500).send({message:'Error general al intentar buscar carrito'});
                                        }else if(shopingFind != ''){
                                            let bills = billsFind;
                                            let carritoCompras = shopingFind;
                                            
                                            return res.send({message:'Bienvenido', bills, carritoCompras, token: jwt.createToken(usernameFind)});                                            
                                        }else{
                                            let bills = billsFind;
                                            let carritoCompras = 'No tienes carrito de compras generado todavia';
                                            
                                            return res.send({message:'Bienvenido', bills, carritoCompras, token: jwt.createToken(usernameFind)});            
                                        }
                                    });
                                }else{
                                    ShoppingCart.find({propietario: params.username}, (err, shopingFind) => {
                                        if(err){
                                            return res.status(500).send({message:'Error general al intentar buscar carrito'});
                                        }else if(shopingFind !=''){
                                            let bills = 'No tienes facturas generadas todavia';
                                            let carritoCompras = shopingFind;
                                            
                                            return res.send({message:'Bienvenido', bills, carritoCompras, token: jwt.createToken(usernameFind)});                                            
                                        }else{
                                            let bills = 'No tienes facturas generadas todavia';
                                            let carritoCompras = 'No tienes carrito de compras generado todavia';
                                            
                                            return res.send({message:'Bienvenido', bills, carritoCompras, token: jwt.createToken(usernameFind)});            
                                        }
                                    });
                                }
                            }).populate('repositoryShoppingCarts');
                            //return res.send({message:'Bienvenido', bills, carritoCompras, token: jwt.createToken(usernameFind)});            
                            //return res.send({token: jwt.createToken(usernameFind)});                            
                        }else{
                            return res.send({message:'Usuario logeado'});
                        }
                    }else{
                        return res.status(404).send({message:'No hay coincidencias en la password'});
                    }
                })
            }else{
                return res.status(401).send({message:'El nombre de usuario es incorrecto'});
            }
        })
    }else{
        return res.status(401).send({message:'Por favor ingresa todos los campos obligatorios'});
    }
}

function setShoppingCart(req, res){
    let userId = req.params.id;
    let params = req.body;
    let shoppingCart = new ShoppingCart();
    let repositoryCart = new RepositoryShoppingCart();

    
    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permisos para realizar esta acción'});
    }else{
        if(params.passwordUser){
            User.findById(userId, (err, adminFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(adminFind){
                    bcrypt.compare(params.passwordUser, adminFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            if(params.nameProduct && params.stockShopping){
                                Product.findOne({nameProduct: params.nameProduct}, (err, productEquals) => {
                                    if(err){
                                        return res.status(500).send({message:'Error general en product'});
                                    }else if(productEquals){
                                        ShoppingCart.findOne({nameProduct: params.nameProduct, propietario: adminFind.username}, (err, shoppingFind) => {
                                            if(err){
                                                return res.status(500).send({message:'Error general al revisar si ya existia un carrito'});
                                            }else if(shoppingFind){
                                                console.log(shoppingFind);
                                                
                                                let stockTotal =  0;
                                                
                                                
                                                stockTotal = shoppingFind.stockShopping + (1 * params.stockShopping); 
                                                console.log('Number stockTotal: ' +stockTotal);
                                                let price = 0;
                                                price = stockTotal * productEquals.price;                                                

                                                if(stockTotal <= productEquals.stock){
                                                    
                                                    User.findOne({_id:userId, shoppingCarts: shoppingFind._id}, (err, userFind) => {
                                                        if(err){
                                                            return res.send({message:'Error general al buscar carrito de compras en user'})
                                                        }else if(userFind){
                                                            
                                                            params.price = productEquals.price * params.stockShopping;
                                                            adminFind.totalShoppingCart = adminFind.totalShoppingCart + params.price;
                                                            adminFind.totaldestock = adminFind.totaldestock + (1 * params.stockShopping);
                                                            let totalStock = adminFind.totaldestock;
                                                            let totalbuy = adminFind.totalShoppingCart;
                                                            params.stockShopping = stockTotal;
                                                            params.price = price;
                                                            params.passwordUser = '';

                                                            
                                                            ShoppingCart.findOneAndUpdate({_id:shoppingFind._id}, params, {new: true}, (err, shopUpd) => {
                                                                if(err){
                                                                    return res.status(500).send({message:'Error general al actualizar carrito'});
                                                                }else if(shopUpd){
                                                                    User.findByIdAndUpdate(userId, {$set: {totalShoppingCart: totalbuy, totaldestock: totalStock}}, {new: true}, (err, userUp) => {
                                                                        if(err){
                                                                            return res.status(500).send({message:'Error general al actualizar'});
                                                                        }else if(userUp){
                                                                            RepositoryShoppingCart.findOneAndUpdate({nameProduct: params.nameProduct}, params, {new:true}, (err, repositoryUpdate) => {
                                                                                if(err){
                                                                                    return res.status(500).send({message:'Error general al actualizar'});
                                                                                }else if(repositoryUpdate){
                                                                                    return res.send({message:'Se agrego al carrito de compras ya existente', tu_Carrito: shopUpd});
                                                                                }else{
                                                                                    return res.status(401).send({message:'No se pudo guardar'});
                                                                                }
                                                                            })                                                                            
                                                                        }else{
                                                                            return res.status(401).send({message:'No se pudo guardar'});
                                                                        }
                                                                    }).populate('shoppingCarts');
                                                                }else{
                                                                    return res.status(401).send({message:'No se pudo actualizar'});
                                                                }
                                                            });
                                                        }else{
                                                            return res.send({message:'El carrito no se pudo agregar'});
                                                        }
                                                    })
                                                }else{
                                                    return res.send({message:'No puedes pedir mas productos del total que es ', stock: productEquals.stock})
                                                }
                                            }else{                                                
                                                params.price = productEquals.price * params.stockShopping;
                                                adminFind.totalShoppingCart = adminFind.totalShoppingCart + params.price;
                                                adminFind.totaldestock = (1*adminFind.totaldestock) + (1 * params.stockShopping);
                                                let totalStock = adminFind.totaldestock;                                                
                                                let totalbuy = adminFind.totalShoppingCart;
                                                
                                                shoppingCart.nameProduct = params.nameProduct;
                                                shoppingCart.stockShopping = params.stockShopping;
                                                shoppingCart.price = params.price;
                                                shoppingCart.propietario = adminFind.username;
                                                //------------------------------------------------------------------------------------------
                                                repositoryCart.nameProduct = params.nameProduct;
                                                repositoryCart.stockShopping = params.stockShopping;
                                                repositoryCart.price = params.price;
                                                repositoryCart.propietario = adminFind.username;
                                                
                                                
                                                //------------------------------------------------------------------------------------------
                                                
                                                shoppingCart.save(params, (err, shopSaved) => {
                                                    if(err){
                                                        return res.status(500).send({message:'Error general al guardar carrito'});
                                                    }else if(shopSaved){                                                        
                                                        User.findByIdAndUpdate(userId, {$set: {totalShoppingCart: totalbuy, totaldestock: totalStock}}, {new: true}, (err, userUp) => {
                                                            if(err){
                                                                return res.status(500).send({message:'Error general al actualizar'});
                                                            }else if(userUp){
                                                                User.findByIdAndUpdate(userId, {$push: {shoppingCarts: shopSaved._id}}, {new: true}, (err, save) => {
                                                                    if(err){
                                                                        return res.status(500).send({message: 'No se guardo el contacto'});
                                                                    }else if(save){
                                                                        repositoryCart.save(params,(err, repositoryCartSaved) => {
                                                                            if(err){
                                                                                return res.status(500).send({message:'Error general al intentar guardar repositoryCart'});
                                                                            }else if(repositoryCartSaved){
                                                                                return res.send({message:'Carrito de compras agregado', tu_Carrito:shopSaved});
                                                                            }else{
                                                                                return res.send({message:'No se pudo guardar el historial del carrito'});
                                                                            }
                                                                        })                                                                        
                                                                    }else{
                                                                        return res.status(500).send({message: 'Error al agregar contacto'});
                                                                    }
                                                                }).populate('shoppingCarts');
                                                            }else{
                                                                return res.status(401).send({message:'No se pudo guardar'});
                                                            }
                                                        });
                                                    }else{
                                                        return res.status(500).send({message:'No se pudo guardar'});
                                                    }
                                                });
                                            }
                                        })
                                    }else{
                                        return res.status(401).send({message:'No se encontraron coincidencias'});
                                    }
                                })
                            }else{
                                return res.status(401).send({message:'Por favor ingresa todos los parametros requeridos'});
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
            return res.status(404).send({message:'No olvides colocar la password de administrador >passwordUser<'});
        }
    }
}

function outOfStockProducts(req, res){
    
    Product.find({stock: {$eq: 0}}, (err, productFind) => {
        if(err){
            return res.status(500).send({message:'Error general al intentar buscar'});
        }else if(productFind != ''){
            return res.send({message:'Productos agotados: ', productFind});
        }else{
            return res.status(401).send({message:'Aun no hay productos agotados'});
        }
    })
}


function creatOrUpdateBill(req, res){
    let userId = req.params.id;
    let bill = new Bills();
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message:'No tienes permisos para realizar esta acción'});
    }else{
        if(params.passwordClient){
            User.findById(userId, (err, adminFind) => {
                if(err){
                    return res.status(500).send({message:'Error al intentar buscar admin'});
                }else if(adminFind){
                    bcrypt.compare(params.passwordClient, adminFind.password, (err, check) => {
                        if(err){
                            return res.status(500).send({message:'Error al comparar password'});
                        }else if(check){
                            if(params.optionBill){
                                if(params.optionBill.toLowerCase() == 'newbill'){
                                    if(params.nameProduct){
                                        RepositoryShoppingCart.findOne({nameProduct: params.nameProduct}, (err, repositoryCartFind) => {
                                            if(err){
                                                return res.status(500).send({message:'Error general al intentar buscar en el historial'});
                                            }else if(repositoryCartFind){
                                                Product.findOne({nameProduct: params.nameProduct}, (err, productFind) => {
                                                    if(err){
                                                        return res.status(500).send({message:'Error general al intentar buscar producto'});
                                                    }else if(productFind){
                                                        let stock = (1* productFind.stock) - (1*repositoryCartFind.stockShopping);
                                                        let totalSale = (1* productFind.totalSale) + (1*repositoryCartFind.stockShopping);
                                                        params.stock = stock;
                                                        params.totalSale = totalSale;                                                        
                                                        
                                                        Product.findOneAndUpdate({nameProduct: params.nameProduct}, params, {new: true}, (err, productUpdate) => {
                                                            if(err){
                                                                return res.status(500).send({message:'Error general al intentar actualizar producto'});
                                                            }else if(productUpdate){
                                                                ShoppingCart.findOneAndRemove({nameProduct: params.nameProduct}, (err, shopingRemoved) => {
                                                                    if(err){
                                                                        return res.status(500).send({message:'Error general al intentar eliminar carrito de compras'});
                                                                    }else if(shopingRemoved){
                                                                    
                                                                        //Creo la factura
                                                                        bill.date = moment().format("MMM-DD-YYYY");
                                                                        bill.total = adminFind.totalShoppingCart;
                                                                        bill.stockTotal = adminFind.totaldestock;
                                                                        bill.propietario = adminFind.username;

                                                                        bill.save((err, billSaved) => {
                                                                            if(err){
                                                                                return res.status(500).send({message:'Error general al intentar crear factura'});
                                                                            }else if(billSaved){
                                                                                User.findByIdAndUpdate(userId, {$push: {bills: billSaved._id}}, {new: true}, (err, userUpdate) => {
                                                                                    if(err){
                                                                                        return res.status(500).send({message:'Error general al intentar guardar la factura en cliente'});
                                                                                    }else if(userUpdate){
                                                                                        let id = billSaved._id;
                                                                                        console.log('id de historial: '+repositoryCartFind._id);
                                                                                        Bills.findByIdAndUpdate(id, {$push: {repositoryShoppingCarts: repositoryCartFind._id}}, {new: true},(err, billsUpdate) => {
                                                                                            if(err){
                                                                                                return res.status(500).send({message:'Error general al intetar guardar historial de carrito en factura'});
                                                                                            }else if(billsUpdate){
                                                                                                User.findByIdAndUpdate(userId, {$pull: {shoppingCarts: shopingRemoved._id}}, {new: true}, (err, userUpdate) => {
                                                                                                    if(err){
                                                                                                        return res.status(500).send({message:'Error general al intentar guardar la factura en cliente'});
                                                                                                    }else if(userUpdate){
                                                                                                        return res.send({message:'Factura generada correctamente', billsUpdate});
                                                                                                    }else{
                                                                                                        return res.status(401).send({message:'No se pudo guardar la factura en el cliente'});
                                                                                                    }
                                                                                                });
                                                                                            }else{
                                                                                                return res.status(401).send({message:'No se pudo guardar el historial en el carrito'});
                                                                                            }
                                                                                        }).populate('repositoryShoppingCarts');
                                                                                                                                                                                
                                                                                    }else{
                                                                                        return res.status(401).send({message:'No se pudo guardar la factura en el cliente'});
                                                                                    }
                                                                                    
                                                                                })                                                                                
                                                                            }else{
                                                                                return res.status(401).send({message:'No se pudo guardar la factura'});
                                                                            }
                                                                            
                                                                        })
                                                                        //
                                                                        
                                                                    }else{
                                                                        return res.status(401).send({message:'No se pudo eliminar el carrito de compras'});
                                                                    }
                                                                })
                                                            }else{
                                                                return res.status(401).send({message:'No se pudo actualizar el producto'});
                                                            }
                                                        });
                                                    }else{
                                                        return res.status(401).send({message:'No se han encontrado coincidencias'});
                                                    }
                                                })
                                            }else{
                                                return res.status(401).send({message:'Nombre de producto no existente o verifica que este bien escrito'})
                                            }
                                        })
                                    }else{
                                        return res.send({message:'Recuerda darnos el nameProduct de tu carrito para comenzar a facturar'});
                                    }
                                }else if(params.optionBill.toLowerCase() == 'updatebill'){
                                    if(params.idBill){
                                        let id = params.idBill
                                        User.findOne({_id:userId, bills:id}, (err, billInUserFind) => {
                                            if(err){
                                                return res.status(500).send({message:'Error general al intentar buscar factura en usuario'});
                                            }else if(billInUserFind){
                                                if(params.nameProduct){
                                                    ShoppingCart.findOne({nameProduct: params.nameProduct}, (err, shopingFind) => {
                                                        if(err){
                                                            return res.status(500).send({message:'Error general al intentar buscar carrito de compras'});
                                                        }else if(shopingFind){                                                            

                                                            RepositoryShoppingCart.findOne({nameProduct: params.nameProduct, propietario: adminFind.username}, (err, repoFind) => {
                                                                if(err){
                                                                    return res.status(500).send({message:'Error general al intentar buscar en el repositorio'});
                                                                }else if(repoFind){
                                                                    Product.findOne({nameProduct: params.nameProduct}, (err, producFind) => {
                                                                        if(err){
                                                                            return res.status(500).send({message:'Error general al buscar producto en actualizar'});
                                                                        }else if(producFind){
                                                                            let stock = (1* producFind.stock) - (1*repoFind.stockShopping);
                                                                            let totalSale = (1* producFind.totalSale) + (1*repoFind.stockShopping);
                                                                            params.stock = stock;
                                                                            params.totalSale = totalSale;
                                                                            console.log('Valor de stock: '+stock+ '  valor de totalSale: '+totalSale);

                                                                            if(stock >= 0){
                                                                                Product.findByIdAndUpdate(producFind._id, params, {new: true}, (err, productUpdate) => {
                                                                                    if(err){
                                                                                        return res.status(500).send({message:'Error general al intentar actualizar producto'});
                                                                                    }else if(productUpdate){
                                                                                        User.findByIdAndUpdate(userId, {$pull: {shoppingCarts: shopingFind._id}}, {new: true}, (err, userUpdate) => {
                                                                                            if(err){
                                                                                                return res.status(500).send({message:'Error general al eliminar carrito de compras en usuario'});
                                                                                            }else if(userUpdate){
                                                                                                ShoppingCart.findOneAndRemove({_id:shopingFind._id}, (err, shopingRemoved) => {
                                                                                                    if(err){
                                                                                                        return res.status(500).send({message:'Error general al intentar remover carrito de compras'});
                                                                                                    }else if(shopingRemoved){
                                                                                                        Bills.findByIdAndUpdate(params.idBill, {$push: {repositoryShoppingCarts: repoFind._id}}, {new: true}, (err, billsUpdate) => {
                                                                                                            if(err){
                                                                                                                return res.status(500).send({message:'Error general al intentar agregar un producto en la factura'});
                                                                                                            }else if(billsUpdate){

                                                                                                            params.total = adminFind.totalShoppingCart;
                                                                                                            params.stockTotal = adminFind.totaldestock;
                                                                                                                
                                                                                                            Bills.findByIdAndUpdate(params.idBill, params, {new: true}, (err, billAgregateProduct) => {
                                                                                                                if(err){
                                                                                                                    return res.status(500).send({message:'Error general al intentar actualizar stock y total'});
                                                                                                                }else if(billAgregateProduct){
                                                                                                                    return res.send({message:'Factura actualizada correctamente', billAgregateProduct});
                                                                                                                }else{
                                                                                                                    return res.status(401).send({message:'No se pudo actualizar'});
                                                                                                                }
                                                                                                            }).populate('repositoryShoppingCarts');
                                                                                                            }else{
                                                                                                                return res.status(401).send({message:'No se pudo agregar producto en la factura'});
                                                                                                            }
                                                                                                        })
                                                                                                    }else{
                                                                                                        return res.status(401).send({message:'No se encontraron resultados'});
                                                                                                    }
                                                                                                })
                                                                                            }else{
                                                                                                return res.status(401).send({message:'No se encontraron resultados'});
                                                                                            }
                                                                                        });
                                                                                    }else{
                                                                                        return res.status(401).send({message:'No se encontraron coincidencias'});
                                                                                    }
                                                                                })
                                                                            }else{
                                                                                return res.send({message:'No puedes facturar una cantidad superior de productos a la que poseemos que es: ', Stock:producFind.stock})
                                                                            }
                                                                            
                                                                        }else{
                                                                            return res.status(401).send({message:'No existe el producto'});
                                                                        }
                                                                    })
                                                                }else{
                                                                    return res.status(401).send({message:'No se encontraron concidencias'});
                                                                }
                                                            })
                                                        }else{
                                                            return res.status(401).send({message:'nameProduct no encontrado en carrito de compras o no existe'});
                                                        }
                                                    })
                                                }else{
                                                    return res.status(401).send({message:'No olvides colocar el nameProduct para agregar a la factura ya existente'});
                                                }
                                            }else{
                                                return res.status(401).send({message:'La facura no fue encontrada'});
                                            }
                                        }).populate('bills');
                                    }else{
                                        return res.status(401).send({message:'No olvides colocar el idBill para poder actualizar'});
                                    }
                                }else{
                                    return res.status(401).send({message:'Las opciones de busqueda son >newBill o updateBill<'})
                                }
                            }else{
                                return res.send({message:'no olvides colocar que tipo de optionBill deseas >newBill o updateBill<'})
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
            return res.status(404).send({message:'No olvides colocar la password de administrador >passwordClient<'});
        }
    }
}


module.exports = {
    creatInit,
    loginUser,
    saveUser,
    updateUser,
    removeClient,

    //functiones de cliente
    saveClient,
    listProducts,
    searchProduct,
    getCategoryProduct,
    setShoppingCart,
    removedUser,
    updateClient,
    outOfStockProducts,
    creatOrUpdateBill
}