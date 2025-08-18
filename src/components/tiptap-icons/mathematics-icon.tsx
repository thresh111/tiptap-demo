import * as React from "react";

export const MathematicsIcon = React.memo(({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 3C2 2.44772 2.44772 2 3 2H21C21.5523 2 22 2.44772 22 3C22 3.55228 21.5523 4 21 4H3C2.44772 4 2 3.55228 2 3Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 12C2 11.4477 2.44772 11 3 11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H3C2.44772 13 2 12.5523 2 12Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 21C2 20.4477 2.44772 20 3 20H21C21.5523 20 22 20.4477 22 21C22 21.5523 21.5523 22 21 22H3C2.44772 22 2 21.5523 2 21Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.29289 6.29289C8.68342 5.90237 9.31658 5.90237 9.70711 6.29289L12 8.58579L14.2929 6.29289C14.6834 5.90237 15.3166 5.90237 15.7071 6.29289C16.0976 6.68342 16.0976 7.31658 15.7071 7.70711L13.4142 10L15.7071 12.2929C16.0976 12.6834 16.0976 13.3166 15.7071 13.7071C15.3166 14.0976 14.6834 14.0976 14.2929 13.7071L12 11.4142L9.70711 13.7071C9.31658 14.0976 8.68342 14.0976 8.29289 13.7071C7.90237 13.3166 7.90237 12.6834 8.29289 12.2929L10.5858 10L8.29289 7.70711C7.90237 7.31658 7.90237 6.68342 8.29289 6.29289Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 15C6 14.4477 6.44772 14 7 14H11C11.5523 14 12 14.4477 12 15C12 15.5523 11.5523 16 11 16H7C6.44772 16 6 15.5523 6 15Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 17C13 16.4477 13.4477 16 14 16H18C18.5523 16 19 16.4477 19 17C19 17.5523 18.5523 18 18 18H14C13.4477 18 13 17.5523 13 17Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 14C15.5523 14 16 14.4477 16 15V19C16 19.5523 15.5523 20 15 20C14.4477 20 14 19.5523 14 19V15C14 14.4477 14.4477 14 15 14Z"
        fill="currentColor"
      />
    </svg>
  );
});

MathematicsIcon.displayName = "MathematicsIcon";
