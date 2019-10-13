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
        let pixels = imageData.data;

        const maze = createRandomMaze(10, 10);
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                pixels = drawTile(getTileLayout(maze[i][j].walls), {x: i, y: j}, pixels, canvasWidth);
            }
        }
        ctx.putImageData(imageData, 0, 0);
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

    return pixels;
}

const createRandomMaze = (width: number, height: number) => {
    const rooms = [
        [WallType.N, WallType.S],
        [WallType.E, WallType.W],
        [WallType.N, WallType.E],
        [WallType.N, WallType.W],
        [WallType.S, WallType.E],
        [WallType.S, WallType.W],
    ];
    const maze: Maze = [];
    for (let i = 0; i < width; i++) {
        maze[i] = [];
        for (let j = 0; j < width; j++) {
            maze[i][j] = {
                walls: rooms[Math.floor(Math.random() * 6)],
                position: {x: i, y: j},
                groupId: 1
            }
        }
    }

    return maze;
}
