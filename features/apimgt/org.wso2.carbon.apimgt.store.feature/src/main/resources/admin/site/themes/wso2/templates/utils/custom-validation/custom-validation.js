$(document).ready(function() {
    $.validator.addMethod('contextExists', function(value, element) {
        if (value.charAt(0) != "/") {
            value = "/" + value;
        }
        var contextExist = false;
        var oldContext=$('#spanContext').text();
        jagg.syncPost("/site/blocks/item-add/ajax/add.jag", { action:"isContextExist", context:value,oldContext:oldContext },
                      function (result) {
                          if (!result.error) {
                              contextExist = result.exist;
                          }
                      });
        return this.optional(element) || contextExist != "true";
    }, 'Duplicate context value.');

    $.validator.addMethod('selected', function(value, element) {
        return value!="";
    },'Select a value for the tier.');

    $.validator.addMethod('validRegistryName', function(value, element) {
        var illegalChars = /([~!@#;%^*+={}\|\\<>\"\'\/,])/;
        return !illegalChars.test(value);
    }, 'Input contains one or more illegal characters  (~ ! @ #  ; % ^ * + = { } | &lt; &gt;, \' / " \\ ) .');

    $.validator.addMethod('noSpace', function(value, element) {
        return !/\s/g.test(value);
    },'Input contains white spaces.');

    $.validator.addMethod('notEmpty', function(value, element) {
        return value !== null && jQuery.trim(value).length > 0;
    },'Input cannot be empty.');

    $.validator.addMethod('validInput', function(value, element) {
        var illegalChars = /([<>\"\'])/;
        return !illegalChars.test(value);
    }, 'Input contains one or more illegal characters  (& &lt; &gt; \'  " ');

    $.validator.addMethod('validateRoles', function(value, element) {
        var valid = false;
        var oldContext=$('#spanContext').text();
        jagg.syncPost("/site/blocks/item-add/ajax/add.jag", { action:"validateRoles", roles:value },
                      function (result) {
                          if (!result.error) {
                              valid = result.response;
                          }
                      });
        return this.optional(element) || valid == true;
    }, 'Invalid role name[s]');

    $.validator.addMethod('validateEndpoints', function (value, element){
        var productionEP = $('#endpoint').val();
        var sandboxEP = $('#sandbox').val();

        return productionEP != "" || sandboxEP != "";
    }, 'A Production or Sandbox URL must be provided.');

    $.validator.addMethod("positiveInteger", function(value, element) {
            return this.optional( element ) || /^[1-9]\d*$/.test( value );
    }, 'Inavlid value');


});