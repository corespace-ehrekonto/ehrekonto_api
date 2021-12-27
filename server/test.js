const validator = require('./assets/login/validatePassword');

const password = "a$KN.kaCQhVTJQ9E;~LNQK[E(aDQ]HXP_\.}V3GVK8]#qW_XFHc)7<@xg#]ZN~)@/eyL=NA9w7^bF-WJMFv/3#Jt,>{iWHKwC/o/";

console.log(validator.passwordStrength(password));