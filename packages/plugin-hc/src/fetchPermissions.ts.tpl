function fetchPermissions(){
  return new Promise((resolve,reject)=>{
    const xhr = new XMLHttpRequest();
    xhr.open('get', `/user/permissions`);
    xhr.onload = function () {
      let responseText = xhr.responseText;
      if (xhr.status == 200) {
        try {
          const {code,data} = JSON.parse(responseText);
          if(code === 0){
            resolve({
               permissions: data.permissions.split(','),
               responseXHR: xhr
            });
          }else{
            reject(xhr);
          }
        } catch (e) {
          reject(xhr);
        }
      } else {
        reject(xhr);
      }
    };
    xhr.onerror = function (e){
      reject(xhr);
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader("Accept", "application/json, text/plain, */*");

    xhr.send();
  });
}

export { fetchPermissions };
