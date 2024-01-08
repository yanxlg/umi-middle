{{#withGlobalResponseInterceptor}}
import interceptor from '@/interceptors/response.interceptor';
{{/withGlobalResponseInterceptor}}

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
            {{#withGlobalResponseInterceptor}}
            interceptor.success(responseText);
            {{/withGlobalResponseInterceptor}}
            reject(xhr);
          }
        } catch (e) {
          {{#withGlobalResponseInterceptor}}
          interceptor.success(responseText);
          {{/withGlobalResponseInterceptor}}
          reject(xhr);
        }
      } else {
        {{#withGlobalResponseInterceptor}}
        interceptor.fail(xhr);
        {{/withGlobalResponseInterceptor}}
        reject(xhr);
      }
    };
    xhr.onerror = function (e){
      {{#withGlobalResponseInterceptor}}
      interceptor.fail(xhr);
      {{/withGlobalResponseInterceptor}}
      reject(xhr);
    }
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader("Accept", "application/json, text/plain, */*");

    xhr.send();
  });
}

export { fetchPermissions };
