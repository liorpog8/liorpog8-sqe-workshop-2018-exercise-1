class Model {

    constructor(line, type, name, condition, value)
    {
        this.line = line;
        this.type = type;
        this.name = name;
        this.condition = condition;
        this.value = value;
    }

    get_tr(){
        return '<tr>' +
            '<td align="center">' + this.line + '</td>' +
            '<td align="center">' + this.type + '</td>' +
            '<td align="center">' + this.name + '</td>' +
            '<td align="center">' + this.condition + '</td>' +
            '<td align="center">' + this.value + '</td>' +
            '</tr>';
    }
}

export {Model};