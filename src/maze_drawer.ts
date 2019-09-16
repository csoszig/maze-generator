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

interface TileData {
    tileLayout: Array<Array<TileElement>>;
    walls: Array<WallType>;
    groupId: number;
    position: Coordinate;
}

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

        const tileData = getTileData([WallType.N, WallType.E], 1);
        for (let i = 0; i < TILE_SIZE; i += 1) {
            for (let j = 0; j < TILE_SIZE; j += 1) {
                const color = getTileTypeColor(tileData.tileLayout[j][i]);
                const x = (canvasWidth - TILE_SIZE) / 2
                pixels[(j * canvasWidth + i) * 4] = color[0];
                pixels[(j * canvasWidth + i) * 4 + 1] = color[1];
                pixels[(j * canvasWidth + i) * 4 + 2] = color[2];
                pixels[(j * canvasWidth + i) * 4 + 3] = color[3];
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }
);


// 0: empty 1: wall 2: floor
const getTileData = (walls: Array<WallType>, groupId: number): TileData => {
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

    return {
        tileLayout,
        walls,
        groupId,
        position: {x: 0, y: 0}
    }
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
