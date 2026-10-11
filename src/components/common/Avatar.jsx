import React from 'react';

/*
 * ALEVATE Avatar
 *
 * Dark + Purple Theme
 *
 * No yellow / amber / green palettes.
 */

const colorPalettes = [

  {
    bg: `
      bg-[#241238]
      text-[#C084FC]
      border-[#6D28D9]
    `
  },

  {
    bg: `
      bg-[#1A1024]
      text-[#A855F7]
      border-[#4C1D95]
    `
  },

  {
    bg: `
      bg-[#2E1065]
      text-[#D8B4FE]
      border-[#7C3AED]
    `
  },

  {
    bg: `
      bg-[#1F1235]
      text-[#E9D5FF]
      border-[#9333EA]
    `
  },

  {
    bg: `
      bg-[#26113F]
      text-[#C084FC]
      border-[#A855F7]
    `
  }

];

export function getInitials(name = '') {

  if (
    !name ||
    typeof name !== 'string'
  ) {
    return 'AL';
  }

  const parts =
    name.trim().split(/\s+/);

  if (parts.length === 1) {

    return parts[0]
      .substring(0, 2)
      .toUpperCase();

  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}

export default function Avatar({
  name = '',
  size = 'md',
  className = '',
  rounded = 'rounded-2xl'
}) {

  const initials =
    getInitials(name);

  /*
   * Consistent palette based on name.
   */

  let hash = 0;

  for (
    let i = 0;
    i < (name || '').length;
    i++
  ) {

    hash =
      (hash << 5) -
      hash +
      name.charCodeAt(i);

    hash |= 0;
  }

  const palette =
    colorPalettes[
      Math.abs(hash) %
      colorPalettes.length
    ];

  const sizeClasses = {

    xs:
      'w-7 h-7 text-[10px]',

    sm:
      'w-8 h-8 text-xs',

    md:
      'w-10 h-10 text-xs',

    lg:
      'w-12 h-12 text-sm',

    xl:
      'w-14 h-14 text-base font-bold',

    '2xl':
      'w-20 h-20 text-xl font-extrabold',

    '3xl':
      'w-24 h-24 text-2xl font-extrabold'

  };

  const selectedSize =
    sizeClasses[size] ||
    sizeClasses.md;

  return (

    <div
      className={`
        shrink-0
        flex
        items-center
        justify-center
        font-bold
        tracking-wider
        border
        select-none
        ${selectedSize}
        ${palette.bg}
        ${rounded}
        ${className}
      `}
      title={name}
      aria-label={name}
    >

      {initials}

    </div>

  );
}