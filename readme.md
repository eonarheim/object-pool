# Object Pool

A small object pool implementation to make it less error prone to use object pools.

## Usage

Here is an example usage.

```typescript
const VectorPool = new Pool<Vector>(
    // Builder Function tells the pool how to build an object
    (x, y) => new Vector(x, y),
    // Recycler Function tells the pool how to update an object for re-use
    (v, x, y) => { v.x = x; v.y = y; return v; },
    // Max size on a pool is important to help catch memory leaks
    100
)

// After the using all Vectors are reclaimed for later use!
const [pos, vel] = VectorPool.using((p: Pool<Vector>) => {
    // Uses the builder or recycler to retrieve a vector instance
    const position = p.get().copyFrom(entities[i].pos);
    const velocity = p.get().copyFrom(entities[i].vel);
    const acceleration = p.get(0, accel);

    // Perform euler position approximation
    const finalVelocity = velocity.add(acceleration.scale(time));
    const finalPosition = position.add(velocity.scale(time)).add(acceleration.scale(.5 * time * time));

    entities[i].pos.copyFrom(finalPosition);
    entities[i].vel.copyFrom(finalVelocity);

    // Returning these vectors from the pool `using()` signals that these will be unmanaged
    // These vectors are taken out of the pool
    return [finalPosition, finalVelocity]
});
```

### Other methods

### get(...args)/done()

Retrieve a value from the pool, will either create or recycle an existing value in the pool

```typescript
// calls the builder or recycler with ...args to give your an instance
const one = VectorPool.get(1, 1); 

// Signals to the pool we are done with all instances and they can be reclaimed
VectorPool.done(); 
```

### done()

```typescript
// Passing a value from the pool to done removes the instance from the pool
// It is no longer tracked and is safe to pass to a consumer
const [unhooked] = VectorPool.done(VectorPool.get(2, 2));

```

### borrow
Using 1 instance of an object in the pool then returning it 

```typescript
VectorPool.borrow((v) => {
    // do something cool
});
// value is returned  to pool after borrow is complete
```


## Local Development

Run the following commands
- `npm install`
- `npm run start` - Runs a local dev server at http://localhost:1234
- `npm run build` - Builds the assets