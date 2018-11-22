import $ from 'jquery';
import {parseCode, parseToTable} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));

        let lines_list = parseToTable(JSON.stringify(parsedCode));
        let trs = '';

        for(let i = 0; i < lines_list.length; i++)
            trs += lines_list[i].get_tr();

        $('#outputTable').html('<table id="d1" border="1"><thead><tr><th>Line</th><th>Type</th><th>Name</th><th>Condition</th><th>Value</th></tr></thead><tbody>' + trs +'</tbody></table>');
        $('table#d1 tr:odd').css('background-color', '#f2f2f2');
    });
});
