import { Pool } from "./pool";
import { Vector } from "./vector";

const VectorPool = new Pool<Vector>(
    // Builder Function tells the pool how to build an object
    (x, y) => new Vector(x, y),
    // Recycler Function tells the pool how to update an object for re-use
    (v, x, y) => { v.x = x; v.y = y; return v; },
    // Max size on a pool is important to help catch memory leaks
    100
)

const entities: { pos: Vector, vel: Vector }[] = [];
const init = () => {
    for (let i = 0; i < 200; i++) {
        entities.push({
            pos: new Vector(Math.random() * 400, Math.random() * 400),
            vel: new Vector(0, 0)
        });
    }
}

// Game time step, .016 seconds for 60 fps
const time = .016;
const accel = 100;

const poolUpdate = (time: number) => {
    // Update 200 things in my game loop
    for (let i = 0; i < entities.length; i++) {
        // After the using all Vectors are reclaimed for later use!
        VectorPool.using((p: Pool<Vector>) => {
            // Uses the builder or recycler to retrieve a vector instance
            const position = p.get().copyFrom(entities[i].pos);
            const velocity = p.get().copyFrom(entities[i].vel);
            const acceleration = p.get(0, accel);
    
            // Perform euler position approximation
            const finalVelocity = velocity.add(acceleration.scale(time));
            const finalPosition = position.add(velocity.scale(time)).add(acceleration.scale(.5 * time * time));
    
            // Returning these vectors from the pool `using()` signals that these will be unmanaged
            entities[i].pos.copyFrom(finalPosition);
            entities[i].vel.copyFrom(finalVelocity);
        });
    }
    // console.log("Total Pool Vector Allocations: ", Vector._ALLOCATIONS);
}


const normalUpdate = (time: number) => {
    // Update 200 things in my game loop
    for (let i = 0; i < entities.length; i++) {
    
        // New vectors
        const position = entities[i].pos;
        const velocity = entities[i].vel;
        const acceleration = new Vector(0, accel);
    
        // Perform euler position approximation
        const finalVelocity = velocity.add(acceleration.scale(time));
        const finalPosition = position.add(velocity.scale(time)).add(acceleration.scale(.5 * time * time));
    
        // Final result
        const result = [finalPosition, finalVelocity];
        entities[i].pos = finalPosition;
        entities[i].vel = finalVelocity;
    }
    // console.log("Total Non-pool Vector Allocations: ", Vector._ALLOCATIONS);
}

const canvas = document.createElement('canvas') as HTMLCanvasElement;
canvas.width = 400;
canvas.height = 400;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

let usePool = true;
const allocations = document.getElementById('allocations') as HTMLSpanElement;
const pooled = document.getElementById('pooled') as HTMLInputElement;
pooled.onchange = () => {
    usePool = !usePool;
    entities.length = 0;
    Vector._ALLOCATIONS = VectorPool.totalAllocations;
    init();
}


let lastTime = 0;
const mainloop = (timeMs: number) => {
    const seconds = (timeMs - lastTime) / 1000;
    lastTime = timeMs;
    usePool ? poolUpdate(seconds) : normalUpdate(seconds);

    ctx.fillStyle = '#176BAA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    entities.forEach((e) => {
        if (e.pos.y > canvas.height - 5) {
            e.pos.y = canvas.height - 5;
            e.vel.y = Math.abs(e.vel.y) < 1 ? 0 : -(e.vel.y * .7);
        }

        ctx.save();
        ctx.fillStyle = 'red';
        ctx.fillRect(e.pos.x - 5, e.pos.y - 5, 10, 10);
        ctx.restore();
    });
    
    window.requestAnimationFrame(mainloop);
    allocations.innerText = Vector._ALLOCATIONS.toString();
}



init();
mainloop(1);