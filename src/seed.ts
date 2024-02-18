import dotenv from 'dotenv';

import { faker } from '@faker-js/faker';

import { floor, random } from 'lodash';
import axios from 'axios';
import { Canvas, CanvasRenderingContext2D, createCanvas } from 'canvas';
dotenv.config({});

function avatarColor(): string {
  const color: string[] = [
    '#FF7FA5',
    '#8DC63F',
    '#FFC0CB',
    '#53777A',
    '#F0E68C',
    '#8B0000',
    '#BDB76B',
    '#008000',
    '#A9A9A9',
    '#D2B48C',
    '#9933FF',
    '#00CED1',
    '#FFA500',
    '#C0C0C0',
    '#4169E1',
    '#FFFF00',
    '#DC143C',
    '#FF00FF',
    '#808080',
    '#0000FF',
    '#FFD700',
    '#800000',
    '#00FF00',
    '#B22222',
    '#FFFFFF'
  ];

  return color[floor(random(0.9) * color.length)];
}

function generateAvatar(text: string, backgroundColor: string, foregroundColor: string = 'white') {
  const canvas: Canvas = createCanvas(200, 200);
  const context: CanvasRenderingContext2D = canvas.getContext('2d');

  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, canvas.height, canvas.width);

  context.font = 'normal 80px sens-serif';
  context.fillStyle = foregroundColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL('image/png');
}

function generateUsername(cacheStorage: Record<string, boolean>): string {
  let newUsername = '';
  // eslint-disable-next-line no-constant-condition
  while (1) {
    newUsername = faker.internet.userName();
    if (newUsername.length > 8 || newUsername.length < 3) {
      continue;
    }
    if (!cacheStorage[newUsername]) {
      cacheStorage[newUsername] = true;
    }
    break;
  }
  return newUsername;
}
function generateEmail(cacheStorage: Record<string, boolean>): string {
  let email = '';
  // eslint-disable-next-line no-constant-condition
  while (1) {
    email = faker.internet.email();
    if (!cacheStorage[email]) {
      cacheStorage[email] = true;
    }
    break;
  }
  return email;
}
async function seedUserData(count: number = 10): Promise<void> {
  let i = 0;
  try {
    const cacheStorage: Record<string, boolean> = {};

    for (i = 0; i < count; i++) {
      const username = generateUsername(cacheStorage);
      const color = avatarColor();

      const avatar = generateAvatar(username.charAt(0).toUpperCase(), color);

      const body = {
        username,
        email: generateEmail(cacheStorage),
        password: '123456',
        avatarColor: color,
        avatarImage: avatar
      };

      console.log(`******* Adding user to database - ${i + 1} of ${count} -- ${username}`);

      await axios.post(`${process.env.API_URL}/signup`, body);
    }
  } catch (error) {
    console.log(error);
  }
}

seedUserData(100);
