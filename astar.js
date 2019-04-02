/**
 * Astar demo
 * By Chester Abrahams
 */

var PathFinder = function(cell_size, cell_x, cell_y, svg)
{
    this.cell_size = cell_size;
    this.cell_x = cell_x;
    this.cell_y = cell_y;

    // Types: color
    this.colors = {
        1: "blue", // Finder
        2: "red", // Target
        3: "black", // Obstacle
        4: "#BBBBBB", // Highlight 1
        5: "#777777" // Highlight 2
    };

    this.svg = svg || document.createElement("svg");
    this.svg.setAttribute("width", this.cell_size*this.cell_x);
    this.svg.setAttribute("height", this.cell_size*this.cell_y);

    this.render();
};

PathFinder.prototype.render = function()
{
    // Prepare map
    {
        this.map = this.map || [];

        for (let x=0; x<this.cell_x; x++)
            this.map[x] = this.map[x] || [];
    }

    // Clear
    this.svg.innerHTML = "";

    // Add new nodes
    for (let x=0; x<this.cell_x; x++)
        for (let y=0; y<this.cell_y; y++)
        {
            let cell = this.map[x][y] || document.createElementNS("http://www.w3.org/2000/svg", "rect");

                this.map[x][y] = cell;

                cell.setAttribute("x", this.cell_size*x);
                cell._x = x;
                cell.setAttribute("y", this.cell_size*y);
                cell._y = y;
                cell.setAttribute("width", this.cell_size);
                cell.setAttribute("height", this.cell_size);
                cell.setAttribute("fill", this.colors[this.map[x][y]["type"]] || "#FFFFFF");
                cell.setAttribute("stroke", "#000000");
                cell.setAttribute("stroke-width", "1");

            cell.type = cell.type || 0;
            cell.setAttribute("type", this.map[x][y]["type"] || 0);

            cell.pf = this;
            cell.onclick = this.clickCell;

            this.svg.appendChild(cell);
        }
};

PathFinder.prototype.clickCell = function()
{
    if (window.typeSelect != 3)
        if (document.querySelector("rect[type='" + window.typeSelect + "']"))
            return;

    if (this.type == 0)
        this.type = window.typeSelect;
    else if (this.type == 3)
        this.type = 0;

    if (window.typeSelect == 1) pf.finder = this;
    if (window.typeSelect == 2) pf.target = this;

    this.pf.render();

    // UI
    {
        // Disable radio's that have already been used
        for (var i=0, types=document.querySelectorAll("form label[type]"); i<types.length; i++)
            if (!document.querySelector("rect[type='" + types[i].getAttribute("type") + ']'))
                types[i].querySelector("input[type='radio']").removeAttribute("disabled");

        // Disable 1
        if (document.querySelector("rect[type='1']"))
            document.querySelector("label[type='1'] input[type=radio]").setAttribute("disabled", "");

        // Disable 2
        if (document.querySelector("rect[type='2']"))
            document.querySelector("label[type='2'] input[type=radio]").setAttribute("disabled", "");
    }
};

PathFinder.prototype.dst = function(a, b)
{
    return Math.abs(a._x-b._x) + Math.abs(a._y-b._y);
};

PathFinder.prototype.reset = function()
{
    for (let x=0; x<pf.cell_x; x++)
        for (let y=0; y<pf.cell_y; y++)
            if (pf.map[x][y].type > 3)
                pf.map[x][y].type = 0;

    pf.render();
};

PathFinder.prototype.runAStar = function()
{
    var list_open = [this.finder],
        list_closed = [];

    // Non-diagonal
    directions = [
        [-1,0], // left
        [0,-1], // up
        [1,0], // right
        [0,1] // down
    ];

    this.finder.G = this.finder.H = this.finder.F = Infinity;

    while(true)
    {
        // list_open is ASC sorted; current=first index
        var current = list_open[0];

        // Move from list_open to list_closed
        list_open.splice(list_open, 1);
        list_closed.push(current);

        // Target has been found
        if (current === this.target)
        {
            // Recursively trace linked nodes and highlight the shortest path
            var parent = current.parent;
            while(true)
            {
                if (parent.type !== 1 && parent.type !== 2) parent.type = 5;
                if (!parent.parent) break;

                parent = parent.parent;
            }

            this.render();

            // Loop end
            return;
        }

        for (var i=0; i<directions.length; i++)
        {
            // Skip if potential neighbor is out of reach
            if (!this.map[current._x+directions[i][0]] || !this.map[current._x+directions[i][0]][current._y+directions[i][1]])
                continue;

            var neighbor = this.map[current._x+directions[i][0]][current._y+directions[i][1]];

            if (neighbor.type === 3 || list_closed.includes(neighbor))
                continue;

            neighbor.H = this.dst(neighbor, this.target);
            neighbor.G = this.dst(neighbor, this.finder, false);
            neighbor.F = neighbor.G + neighbor.H;

            //if (neighbor.type > 3 || neighbor.type === 0) neighbor.type = 4;

            if (neighbor.F < current.F || !list_open.includes(neighbor))
            {
                neighbor.parent = current;

                for (var j=list_open.length-1; j>=-1; j-=1)
                    if ( j<=-1 || neighbor.G < list_open[j].G)
                    {
                        list_open.splice(j, 0, neighbor);
                        break;
                    }
            }
        }
    }
};

window.onload = function()
{
    window.pf = new PathFinder(
        15, 15, 15,
        document.querySelector("#display")
    );

    document.querySelector("#reset").onclick = pf.reset;
    document.querySelector("#run").onclick = pf.runAStar.bind(pf);
    document.querySelector("form label[type='1']").click();
};
