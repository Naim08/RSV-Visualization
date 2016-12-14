$(function(){

    var ul = $('#upload ul');

    $('#drop a').click(function(){
        // Simulate a click on the file input button
        // to show the file browser dialog
        if($(this).text() == "Browse") {
        $(this).parent().find('#id_docfile').click();

        var tpl = $('<p><i class="fa fa-file-excel-o uploadfile" style="font-size: 80px;color: #29AFDF;"></i>');
            
         
          $('input[type="file"]').change(function(e){
              $(this).parent().prepend(tpl); 
            var fileName = e.target.files[0].name;
            $('.uploadfile').append('<p>'+fileName +'</p'); 
        });
        $(this).text()
        $(this).html("Submit");
        } else if($(this).text() == "Submit") {
            $(this).parent().find('#uploadfile').click();
        }
    });
    // Initialize the jQuery File Upload plugin
   


    // Prevent the default action when a file is dropped on the window
    $(document).on('drop dragover', function (e) {
        e.preventDefault();
    });

    // Helper function that formats the file sizes
    function formatFileSize(bytes) {
        if (typeof bytes !== 'number') {
            return '';
        }

        if (bytes >= 1000000000) {
            return (bytes / 1000000000).toFixed(2) + ' GB';
        }

        if (bytes >= 1000000) {
            return (bytes / 1000000).toFixed(2) + ' MB';
        }

        return (bytes / 1000).toFixed(2) + ' KB';
    }

});