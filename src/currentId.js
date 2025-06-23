let currentId = null;

function setId(id){
    currentId = id;
};

function getId(){
    return currentId;
};

export {setId, getId}