const TILE_SIZE = 10;

const enum WallType {
    EMPTY,
    N,
    E,
    S,
    W,
}

enum TileElement {
    WALL,
    FLOOR,
    EMPTY,
}

interface Coordinate {
    x: number;
    y: number;
}

type TileLayout = Array<Array<TileElement>>;

interface TileData {
    walls: Array<WallType>;
    groupId: number;
    position: Coordinate;
}

type Maze = Array<Array<TileData>>;

const main = (canvasId: string) => window.addEventListener(
    "load",
    () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (canvas == null) {
            throw Error(`Canvas with id:${canvasId} cannot be found.`);
        }

        const ctx = canvas.getContext("2d");
        if (ctx == null) {
            throw Error(`Context is null.`);
        }

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        ctx.clearRect(0,0,canvasWidth, canvasHeight);
        let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        // let pixels = imageData.data;

        const maze = createRandomMaze(10, 10, imageData, canvasWidth, ctx);
        // for (let i = 0; i < 10; i++) {
        //     for (let j = 0; j < 10; j++) {
        //         pixels = drawTile(getTileLayout(maze[i][j].walls), {x: i, y: j}, pixels, canvasWidth);
        //     }
        // }
        // ctx.putImageData(imageData, 0, 0);
    }
);

// 0: empty 1: wall 2: floor
const getTileLayout = (walls: Array<WallType>): TileLayout => {
    let tileLayout = [...new Array(TILE_SIZE)];
    tileLayout = tileLayout.map((row) => {
        row = [...new Array(TILE_SIZE)];
        return row.map(() => TileElement.FLOOR);
    })

    if (walls.indexOf(WallType.N) > -1) {
        tileLayout[0] = tileLayout[0].map(() => TileElement.WALL);
        tileLayout[1] = tileLayout[1].map(() => TileElement.WALL);
    }

    if (walls.indexOf(WallType.E) > -1) {
        tileLayout = tileLayout.map((row) => {
            row[TILE_SIZE - 1] = TileElement.WALL;
            row[TILE_SIZE - 2] = TileElement.WALL;
            return row;
        });
    }

    if (walls.indexOf(WallType.S) > -1) {
        tileLayout[TILE_SIZE - 1] = tileLayout[TILE_SIZE - 1].map(() => TileElement.WALL);
        tileLayout[TILE_SIZE - 2] = tileLayout[TILE_SIZE - 2].map(() => TileElement.WALL);
    }

    if (walls.indexOf(WallType.W) > -1) {
        tileLayout = tileLayout.map((row) => {
            row[0] = TileElement.WALL;
            row[1] = TileElement.WALL;
            return row;
        });
    }

    return tileLayout;
}

const getTileTypeColor = (tileType: TileElement) => {
    switch (tileType) {
        case TileElement.EMPTY:
            return [30, 30, 30, 255];
        case TileElement.WALL:
            return [30, 30, 30, 255];
        case TileElement.FLOOR:
            return [200, 200, 200, 255];
        default:
            return [0, 0, 0, 255];
    }
}

const drawTile = (tileLayout: TileLayout, position: Coordinate, pixels: Uint8ClampedArray, canvasWidth: number) =>  {
    for (let i = 0; i < TILE_SIZE; i += 1) {
        for (let j = 0; j < TILE_SIZE; j += 1) {
            const color = getTileTypeColor(tileLayout[j][i]);
            const x = position.x * TILE_SIZE + i;
            const y = (position.y * TILE_SIZE + j) * canvasWidth;
            pixels[(x + y) * 4] = color[0];
            pixels[(x + y) * 4 + 1] = color[1];
            pixels[(x + y) * 4 + 2] = color[2];
            pixels[(x + y) * 4 + 3] = color[3];
        }
    }
}

const sleep = async (sec: number) => {
    return new Promise( resolve => setTimeout(resolve, sec * 1000) );
}

const createRandomMaze = async (width: number, height: number, imageData: ImageData, canvasWidth: number, ctx: CanvasRenderingContext2D) => {
    const maze: Maze = [];
    for (let j = 0; j < width; j++) {
        for (let i = 0; i < height; i++) {
            if (j === 0) {
                maze[i] = [];
            }

            const validRooms = getValidRooms(
                i > 0 ? maze[i - 1][j] : null,
                j > 0 ? maze[i][j - 1] : null,
                {
                    walls: [WallType.EMPTY],
                    position: {x: i, y: j},
                    groupId: 1
                },
                {
                    walls: [WallType.EMPTY],
                    position: {x: i, y: j},
                    groupId: 1
                },
            );

            await sleep(0.1);
            maze[i][j] = {
                walls: validRooms[Math.floor(Math.random() * validRooms.length)],
                position: {x: i, y: j},
                groupId: 1
            }
            drawTile(getTileLayout(maze[i][j].walls), {x: i, y: j}, imageData.data, canvasWidth);
            ctx.putImageData(imageData, 0, 0);
        }
    }

    return maze;
}

const getValidRooms = (left: TileData | null, up: TileData | null, right: TileData | null, down: TileData | null) => {
    const walls = {
        [WallType.N]: 0,
        [WallType.E]: 0,
        [WallType.S]: 0,
        [WallType.W]: 0,
    }

    if (left == null || left.walls.indexOf(WallType.E) > -1) {
        walls[WallType.W] = 1;
    } else if (left.walls.indexOf(WallType.EMPTY) > -1) {
        walls[WallType.W] = 2;
    }

    if (right == null || right.walls.indexOf(WallType.W) > -1) {
        walls[WallType.E] = 1;
    } else if (right.walls.indexOf(WallType.EMPTY) > -1) {
        walls[WallType.E] = 2;
    }

    if (up == null || up.walls.indexOf(WallType.S) > -1) {
        walls[WallType.N] = 1;
    } else if (up.walls.indexOf(WallType.EMPTY) > -1) {
        walls[WallType.N] = 2;
    }

    if (down == null || down.walls.indexOf(WallType.N) > -1) {
        walls[WallType.S] = 1;
    } else if (down.walls.indexOf(WallType.EMPTY) > -1) {
        walls[WallType.S] = 2;
    }

    let validWalls = [];
    if (walls[WallType.N] > 0 && walls[WallType.S] > 0 && walls[WallType.E] !== 1 && walls[WallType.W] !== 1) {
        validWalls.push([WallType.N, WallType.S]);
    }
    if (walls[WallType.N] > 0 && walls[WallType.E] > 0 && walls[WallType.S] !== 1 && walls[WallType.W] !== 1) {
        validWalls.push([WallType.N, WallType.E]);
    }
    if (walls[WallType.N] > 0 && walls[WallType.W] > 0 && walls[WallType.E] !== 1 && walls[WallType.S] !== 1) {
        validWalls.push([WallType.N, WallType.W]);
    }
    if (walls[WallType.S] > 0 && walls[WallType.E] > 0 && walls[WallType.N] !== 1 && walls[WallType.W] !== 1) {
        validWalls.push([WallType.S, WallType.E]);
    }
    if (walls[WallType.S] > 0 && walls[WallType.W] > 0 && walls[WallType.N] !== 1 && walls[WallType.E] !== 1) {
        validWalls.push([WallType.S, WallType.W]);
    }
    if (walls[WallType.E] > 0 && walls[WallType.W] > 0 && walls[WallType.S] !== 1 && walls[WallType.N] !== 1) {
        validWalls.push([WallType.E, WallType.W]);
    }

    return validWalls;
}
