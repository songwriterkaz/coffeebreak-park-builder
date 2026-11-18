// Pure park layout edits. Pieces stay owned when they leave the plot.
export function clonePieces(pieces) {
  return (pieces || []).map((p) => ({ id: p.id, x: p.x, z: p.z, r: p.r | 0, v: p.v | 0 }));
}

export function orientedFp(fp, rot) {
  const w = fp[0], d = fp[1];
  return (rot | 0) % 2 ? [d, w] : [w, d];
}

export function snapAxis(value, size, grid, half) {
  const g = grid || 4;
  let x = Math.round((value - (size / 2) % g) / g) * g + (size / 2) % g;
  const min = -half + size / 2;
  const max = half - size / 2;
  if (min > max) return 0;
  if (x < min) x = min;
  if (x > max) x = max;
  return x;
}

export function overlaps(a, b, fpOf) {
  const [w, d] = orientedFp(fpOf(a.id), a.r);
  const [w2, d2] = orientedFp(fpOf(b.id), b.r);
  return Math.abs(a.x - b.x) * 2 < w + w2 - 0.01 && Math.abs(a.z - b.z) * 2 < d + d2 - 0.01;
}

function freeOf(list, trial, fpOf, ignore) {
  return !list.some((other, index) => index !== ignore && overlaps(trial, other, fpOf));
}

export function autoTidy(pieces, fpOf, grid, half) {
  const out = [];
  for (const src of clonePieces(pieces)) {
    const [w, d] = orientedFp(fpOf(src.id), src.r);
    const baseX = snapAxis(src.x, w, grid, half);
    const baseZ = snapAxis(src.z, d, grid, half);
    let placed = null;
    for (let ring = 0; ring < 16 && !placed; ring++) {
      for (let ix = -ring; ix <= ring && !placed; ix++) {
        for (let iz = -ring; iz <= ring; iz++) {
          if (ring && Math.max(Math.abs(ix), Math.abs(iz)) !== ring) continue;
          const trial = {
            ...src,
            x: snapAxis(baseX + ix * grid, w, grid, half),
            z: snapAxis(baseZ + iz * grid, d, grid, half),
          };
          if (freeOf(out, trial, fpOf, -1)) { placed = trial; break; }
        }
      }
    }
    out.push(placed || { ...src, x: baseX, z: baseZ });
  }
  return out;
}

export function movePieces(pieces, indexes, dx, dz, fpOf, grid, half) {
  const next = clonePieces(pieces);
  const chosen = new Set(indexes);
  for (const index of indexes) {
    const [w, d] = orientedFp(fpOf(next[index].id), next[index].r);
    next[index].x = snapAxis(pieces[index].x + dx, w, grid, half);
    next[index].z = snapAxis(pieces[index].z + dz, d, grid, half);
  }
  for (let i = 0; i < next.length; i++) {
    for (let j = i + 1; j < next.length; j++) {
      if (overlaps(next[i], next[j], fpOf)) return null;
    }
  }
  return next;
}

export function rotatePieces(pieces, indexes, fpOf, grid, half) {
  let next = clonePieces(pieces);
  for (const index of indexes) {
    next[index].r = (next[index].r + 1) % 4;
    const [w, d] = orientedFp(fpOf(next[index].id), next[index].r);
    next[index].x = snapAxis(next[index].x, w, grid, half);
    next[index].z = snapAxis(next[index].z, d, grid, half);
    for (let j = 0; j < next.length; j++) {
      if (j !== index && overlaps(next[index], next[j], fpOf)) return null;
    }
  }
  return next;
}

export function pickupPieces(pieces, indexes) {
  const drop = new Set(indexes);
  return clonePieces(pieces).filter((_, index) => !drop.has(index));
}

export function starterSpeakers(plotX, plotZ) {
  const out = [];
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 + Math.PI / 10;
    const yaw = Math.atan2(Math.cos(a), Math.sin(a));
    let r = Math.round(-yaw / (Math.PI / 2));
    r = ((r % 4) + 4) % 4;
    out.push({
      id: 'Speaker',
      x: Math.round(Math.cos(a) * 20 - plotX),
      z: Math.round(Math.sin(a) * 20 - plotZ),
      r,
      v: 0,
    });
  }
  return out;
}

export function insideBox(piece, box) {
  const minX = Math.min(box.x0, box.x1);
  const maxX = Math.max(box.x0, box.x1);
  const minZ = Math.min(box.z0, box.z1);
  const maxZ = Math.max(box.z0, box.z1);
  return piece.x >= minX && piece.x <= maxX && piece.z >= minZ && piece.z <= maxZ;
}
