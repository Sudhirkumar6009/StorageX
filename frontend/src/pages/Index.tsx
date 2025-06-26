import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Lottie from 'lottie-react';
import earthAnimation from '@/assets/logo.png';
import outVideo from '../assets/Comp.mp4';
import { Player } from 'video-react';
import '@/pages/Index.css';
import remix from '@/assets/remix.svg';

const Index = () => {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Decentralized Storage',
      description:
        'Store your files on IPFS network with permanent, distributed access',
      icon: '🌐',
    },
    {
      title: 'Blockchain Integration',
      description:
        'Connect your Web3 wallet for secure blockchain interactions',
      icon: '⛓️',
    },
    {
      title: 'Secure & Private',
      description:
        'Your files are encrypted and distributed across the network',
      icon: '🔒',
    },
    {
      title: 'Global Access',
      description: 'Access your files from anywhere in the world, anytime',
      icon: '🌍',
    },
  ];

  const companyLogos = [
    {
      img: 'https://static.cdnlogo.com/logos/m/25/mongodb.svg',
      name: 'MongoDB',
    },
    {
      img: 'https://i.ibb.co/n4y03Fs/Metamask-NZ-Crypto-wallet.png',
    },
    {
      img: 'https://i.ibb.co/F4CCQsmY/Google.png',
    },
    {
      img: 'https://i.ibb.co/CKBscq9S/filebase.png',
    },
    {
      img: 'https://i.ibb.co/ns6whb4j/walletconnect.png',
    },
    {
      img: remix,
    },
    {
      img: 'https://crust.network/img/logo.png',
    },
    {
      img: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Ipfs-logo-1024-ice-text.png',
    },
  ];

  function InfiniteHorizontalScroll() {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const scrollContainer = scrollRef.current;
      if (!scrollContainer) return;

      let animationFrame: number;
      let scrollAmount = 0;

      const scrollStep = () => {
        scrollAmount += 1;
        if (scrollAmount >= scrollContainer.scrollWidth / 2) {
          scrollAmount = 0;
        }
        scrollContainer.scrollLeft = scrollAmount;
        animationFrame = requestAnimationFrame(scrollStep);
      };

      animationFrame = requestAnimationFrame(scrollStep);

      return () => cancelAnimationFrame(animationFrame);
    }, []);

    const logos = [...companyLogos, ...companyLogos];

    return (
      <div className="w-full flex justify-center pb-10 bg-transparent">
        <div
          ref={scrollRef}
          className="w-full pt-2 max-w-7xl overflow-hidden relative"
          style={{
            height: '15rem',
            maskImage:
              'linear-gradient(to right, transparent 0%, black 10%, black 25% ,black 50%, black 90%, transparent 100%)',
          }}
        >
          <div
            className="flex flex-column gap-5 animate-none"
            style={{ width: '200px', height: '200px', minHeight: '200px' }}
          >
            {logos.map((logo, idx) => (
              <div
                key={idx}
                className={`flex items-center hover:bg-[#00bfff] hover:scale-105 transition-transform duration-200 justify-center rounded-lg shadow-md border border-gray-200 ${
                  theme === 'dark'
                    ? 'bg-transparent border-gray-800 hover:border-[#00BFFF]'
                    : 'bg-[#66d9ff] border-gray-200 hover:border-[#00BFFF]'
                }`}
                style={{
                  width: 200,
                  height: 200,
                  minWidth: 220,
                  minHeight: 220,
                }}
              >
                <img
                  src={logo.img}
                  alt={logo.name}
                  style={{
                    height: '90%',
                    width: '90%',
                    objectFit: 'contain',
                    marginRight: 16,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'bg-black' : 'bg-white'
      }`}
    >
      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row w-full">
            {/* Left Side */}
            <div className="flex-1 text-left flex p-6 sm:p-10 lg:p-20 gap-5 flex-col justify-center">
              <h1
                className={`text-3xl md:text-7xl mb-6 ${
                  theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                } font-[sans-serif] tracking-widest `}
              >
                <img
                  src="https://i.ibb.co/W4bsrLGW/logo.png"
                  alt="Logo"
                  className="pr-5 h-12 w-34 sm:h-28 sm:w-32 inline-block mb-2 object-contain"
                />
                StorageX
              </h1>
              <p>
                <span
                  className={`text-2xl uppercase ${
                    theme === 'dark' ? 'text-white' : 'text-[#00BFFF]'
                  } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] font-bold tracking-wider `}
                >
                  Decentralized File Storage Solution
                </span>
              </p>
              <p
                className={`md:text-xl mb-8 max-w-3xl ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}
                style={{
                  textAlign: 'left',
                  marginLeft: 0,
                  marginRight: 'auto',
                  letterSpacing: '0.5px',
                  fontFamily:
                    '"Century Gothic", CenturyGothic, AppleGothic, sans-serif',
                }}
              >
                The future of decentralized storage. Store, access, and manage
                your files on the InterPlanetary File System with blockchain
                security.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-left">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      className={`text-lg px-10 py-4 h-15 text-xl ${
                        theme === 'dark'
                          ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
                          : 'bg-[#00BFFF] text-white hover:bg-[#0099CC]'
                      }`}
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button
                        size="lg"
                        className={`text-lg px-10 py-4 h-15 text-xl ${
                          theme === 'dark'
                            ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
                            : 'bg-[#00BFFF] text-white hover:bg-[#0099CC]'
                        }`}
                      >
                        Get Started Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            {/* Right Side */}
            <div className="flex-1 flex flex-col justify-center items-center ">
              {/* Replace video with SVG */}
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  id="svg-global"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 94 136"
                  className="w-60 h-80 md:w-80 md:h-[32rem] max-w-full"
                >
                  <path
                    stroke="#0086b3"
                    d="M87.3629 108.433L49.1073 85.3765C47.846 84.6163 45.8009 84.6163 44.5395 85.3765L6.28392 108.433C5.02255 109.194 5.02255 110.426 6.28392 111.187L44.5395 134.243C45.8009 135.004 47.846 135.004 49.1073 134.243L87.3629 111.187C88.6243 110.426 88.6243 109.194 87.3629 108.433Z"
                    id="line-v1"
                  ></path>
                  <path
                    stroke="#0086b3"
                    d="M91.0928 95.699L49.2899 70.5042C47.9116 69.6734 45.6769 69.6734 44.2986 70.5042L2.49568 95.699C1.11735 96.5298 1.11735 97.8767 2.49568 98.7074L44.2986 123.902C45.6769 124.733 47.9116 124.733 49.2899 123.902L91.0928 98.7074C92.4712 97.8767 92.4712 96.5298 91.0928 95.699Z"
                    id="line-v2"
                  ></path>
                  <g id="node-server">
                    <path
                      fill="#00BFFF"
                      d="M2.48637 72.0059L43.8699 96.9428C45.742 98.0709 48.281 97.8084 50.9284 96.2133L91.4607 71.7833C92.1444 71.2621 92.4197 70.9139 92.5421 70.1257V86.1368C92.5421 86.9686 92.0025 87.9681 91.3123 88.3825C84.502 92.4724 51.6503 112.204 50.0363 113.215C48.2352 114.343 45.3534 114.343 43.5523 113.215C41.9261 112.197 8.55699 91.8662 2.08967 87.926C1.39197 87.5011 1.00946 86.5986 1.00946 85.4058V70.1257C1.11219 70.9289 1.49685 71.3298 2.48637 72.0059Z"
                    ></path>
                    <path
                      stroke="#0086b3"
                      fill="#0086b3"
                      d="M91.0928 68.7324L49.2899 43.5375C47.9116 42.7068 45.6769 42.7068 44.2986 43.5375L2.49568 68.7324C1.11735 69.5631 1.11735 70.91 2.49568 71.7407L44.2986 96.9356C45.6769 97.7663 47.9116 97.7663 49.2899 96.9356L91.0928 71.7407C92.4712 70.91 92.4712 69.5631 91.0928 68.7324Z"
                    ></path>
                    <mask
                      height="41"
                      width="67"
                      y="50"
                      x="13"
                      maskUnits="userSpaceOnUse"
                      id="mask0_204_217"
                    >
                      <path
                        fill="#0086b3"
                        d="M78.3486 68.7324L49.0242 51.0584C47.6459 50.2276 45.4111 50.2276 44.0328 51.0584L14.7084 68.7324C13.3301 69.5631 13.3301 70.91 14.7084 71.7407L44.0328 89.4148C45.4111 90.2455 47.6459 90.2455 49.0242 89.4148L78.3486 71.7407C79.7269 70.91 79.727 69.5631 78.3486 68.7324Z"
                      ></path>
                    </mask>
                    <g mask="url(#mask0_204_217)">
                      <path
                        fill="#0086b3"
                        d="M78.3486 68.7324L49.0242 51.0584C47.6459 50.2276 45.4111 50.2276 44.0328 51.0584L14.7084 68.7324C13.3301 69.5631 13.3301 70.91 14.7084 71.7407L44.0328 89.4148C45.4111 90.2455 47.6459 90.2455 49.0242 89.4148L78.3486 71.7407C79.7269 70.91 79.727 69.5631 78.3486 68.7324Z"
                      ></path>
                      <mask
                        height="29"
                        width="48"
                        y="56"
                        x="23"
                        maskUnits="userSpaceOnUse"
                        id="mask1_204_217"
                      >
                        <path
                          fill="#0086b3"
                          d="M68.9898 68.7324L49.0242 56.699C47.6459 55.8683 45.4111 55.8683 44.0328 56.699L24.0673 68.7324C22.6889 69.5631 22.6889 70.91 24.0673 71.7407L44.0328 83.7741C45.4111 84.6048 47.6459 84.6048 49.0242 83.7741L68.9898 71.7407C70.3681 70.91 70.3681 69.5631 68.9898 68.7324Z"
                        ></path>
                      </mask>
                      <g mask="url(#mask1_204_217)">
                        <path
                          fill="#0086b3"
                          d="M68.9898 68.7324L49.0242 56.699C47.6459 55.8683 45.4111 55.8683 44.0328 56.699L24.0673 68.7324C22.6889 69.5631 22.6889 70.91 24.0673 71.7407L44.0328 83.7741C45.4111 84.6048 47.6459 84.6048 49.0242 83.7741L68.9898 71.7407C70.3681 70.91 70.3681 69.5631 68.9898 68.7324Z"
                        ></path>
                        <path
                          fill="#0086b3"
                          d="M70.1311 69.3884L48.42 56.303C47.3863 55.6799 45.7103 55.6799 44.6765 56.303L22.5275 69.6523C21.4938 70.2754 21.4938 71.2855 22.5275 71.9086L44.2386 84.994C45.2723 85.617 46.9484 85.617 47.9821 84.994L70.1311 71.6446C71.1648 71.0216 71.1648 70.0114 70.1311 69.3884Z"
                        ></path>
                        <path
                          fill="#0086b3"
                          d="M70.131 70.8923L48.4199 57.8069C47.3862 57.1839 45.7101 57.1839 44.6764 57.8069L22.5274 71.1562C21.4937 71.7793 21.4937 72.7894 22.5274 73.4125L44.2385 86.4979C45.2722 87.1209 46.9482 87.1209 47.982 86.4979L70.131 73.1486C71.1647 72.5255 71.1647 71.5153 70.131 70.8923Z"
                        ></path>
                        <path
                          fill="#0086b3"
                          d="M69.751 72.1675L48.4199 59.3111C47.3862 58.6881 45.7101 58.6881 44.6764 59.3111L23.2004 72.2548C22.1667 72.8779 22.1667 73.888 23.2004 74.5111L44.5315 87.3674C45.5653 87.9905 47.2413 87.9905 48.2751 87.3674L69.751 74.4238C70.7847 73.8007 70.7847 72.7905 69.751 72.1675Z"
                        ></path>
                        <path
                          fill="#0086b3"
                          d="M68.5091 72.9231L48.4199 60.8153C47.3862 60.1922 45.7101 60.1922 44.6764 60.8153L24.8146 72.7861C23.7808 73.4091 23.7808 74.4193 24.8146 75.0424L44.9038 87.1502C45.9375 87.7733 47.6135 87.7733 48.6473 87.1502L68.5091 75.1794C69.5428 74.5563 69.5428 73.5462 68.5091 72.9231Z"
                        ></path>
                        <path
                          fill="#0086b3"
                          d="M66.6747 73.3219L48.4199 62.3197C47.3862 61.6966 45.7101 61.6966 44.6764 62.3197L26.4412 73.3101C25.4075 73.9332 25.4075 74.9433 26.4412 75.5664L44.696 86.5686C45.7297 87.1917 47.4058 87.1917 48.4395 86.5686L66.6747 75.5782C67.7084 74.9551 67.7084 73.945 66.6747 73.3219Z"
                        ></path>
                      </g>
                      <path stroke-width="0.5" stroke="#00BFFF"></path>
                    </g>
                  </g>
                  <g id="particles">
                    <path
                      fill="#00BFFF"
                      d="M43.5482 32.558C44.5429 32.558 45.3493 31.7162 45.3493 30.6778C45.3493 29.6394 44.5429 28.7976 43.5482 28.7976C42.5535 28.7976 41.7471 29.6394 41.7471 30.6778C41.7471 31.7162 42.5535 32.558 43.5482 32.558Z"
                      className="particle p1"
                    ></path>
                    <path
                      fill="#00BFFF"
                      d="M50.0323 48.3519C51.027 48.3519 51.8334 47.5101 51.8334 46.4717C51.8334 45.4333 51.027 44.5915 50.0323 44.5915C49.0375 44.5915 48.2311 45.4333 48.2311 46.4717C48.2311 47.5101 49.0375 48.3519 50.0323 48.3519Z"
                      className="particle p2"
                    ></path>
                    <path
                      fill="#00BFFF"
                      d="M40.3062 62.6416C41.102 62.6416 41.7471 61.9681 41.7471 61.1374C41.7471 60.3067 41.102 59.6332 40.3062 59.6332C39.5104 59.6332 38.8653 60.3067 38.8653 61.1374C38.8653 61.9681 39.5104 62.6416 40.3062 62.6416Z"
                      className="particle p3"
                    ></path>
                    <path
                      fill="#00BFFF"
                      d="M50.7527 73.9229C52.1453 73.9229 53.2743 72.7444 53.2743 71.2906C53.2743 69.8368 52.1453 68.6583 50.7527 68.6583C49.3601 68.6583 48.2311 69.8368 48.2311 71.2906C48.2311 72.7444 49.3601 73.9229 50.7527 73.9229Z"
                      className="particle p4"
                    ></path>
                    <path
                      fill="#00BFFF"
                      d="M48.5913 76.9312C49.1882 76.9312 49.672 76.4262 49.672 75.8031C49.672 75.1801 49.1882 74.675 48.5913 74.675C47.9945 74.675 47.5107 75.1801 47.5107 75.8031C47.5107 76.4262 47.9945 76.9312 48.5913 76.9312Z"
                      className="particle p5"
                    ></path>
                    <path
                      fill="#00BFFF"
                      d="M52.9153 67.1541C53.115 67.1541 53.2768 66.9858 53.2768 66.7781C53.2768 66.5704 53.115 66.402 52.9153 66.402C52.7156 66.402 52.5538 66.5704 52.5538 66.7781C52.5538 66.9858 52.7156 67.1541 52.9153 67.1541Z"
                      className="particle p6"
                    ></path>
                    <path
                      fill="#00BFFF"
                      d="M52.1936 43.8394C52.7904 43.8394 53.2743 43.3344 53.2743 42.7113C53.2743 42.0883 52.7904 41.5832 52.1936 41.5832C51.5967 41.5832 51.1129 42.0883 51.1129 42.7113C51.1129 43.3344 51.5967 43.8394 52.1936 43.8394Z"
                      className="particle p7"
                    ></path>
                    <path
                      fill="#00BFFF"
                      d="M57.2367 29.5497C57.8335 29.5497 58.3173 29.0446 58.3173 28.4216C58.3173 27.7985 57.8335 27.2935 57.2367 27.2935C56.6398 27.2935 56.156 27.7985 56.156 28.4216C56.156 29.0446 56.6398 29.5497 57.2367 29.5497Z"
                      className="particle p8"
                    ></path>
                    <path
                      fill="#00BFFF"
                      d="M43.9084 34.8144C44.3063 34.8144 44.6289 34.4777 44.6289 34.0623C44.6289 33.647 44.3063 33.3102 43.9084 33.3102C43.5105 33.3102 43.188 33.647 43.188 34.0623C43.188 34.4777 43.5105 34.8144 43.9084 34.8144Z"
                      className="particle p9"
                    ></path>
                  </g>
                  <g id="panel-rigth">
                    <mask fill="white" id="path-26-inside-1_204_217">
                      <path d="M72 91.8323C72 90.5121 72.9268 88.9068 74.0702 88.2467L87.9298 80.2448C89.0731 79.5847 90 80.1198 90 81.44V81.44C90 82.7602 89.0732 84.3656 87.9298 85.0257L74.0702 93.0275C72.9268 93.6876 72 93.1525 72 91.8323V91.8323Z"></path>
                    </mask>
                    <path
                      fill="#91DDFB"
                      d="M72 91.8323C72 90.5121 72.9268 88.9068 74.0702 88.2467L87.9298 80.2448C89.0731 79.5847 90 80.1198 90 81.44V81.44C90 82.7602 89.0732 84.3656 87.9298 85.0257L74.0702 93.0275C72.9268 93.6876 72 93.1525 72 91.8323V91.8323Z"
                    ></path>
                    <path
                      mask="url(#path-26-inside-1_204_217)"
                      fill="#489CB7"
                      d="M72 89.4419L90 79.0496L72 89.4419ZM90.6928 81.44C90.6928 82.9811 89.6109 84.8551 88.2762 85.6257L74.763 93.4275C73.237 94.3085 72 93.5943 72 91.8323V91.8323C72 92.7107 72.9268 92.8876 74.0702 92.2275L87.9298 84.2257C88.6905 83.7865 89.3072 82.7184 89.3072 81.84L90.6928 81.44ZM72 94.2227V89.4419V94.2227ZM88.2762 80.0448C89.6109 79.2742 90.6928 79.8989 90.6928 81.44V81.44C90.6928 82.9811 89.6109 84.8551 88.2762 85.6257L87.9298 84.2257C88.6905 83.7865 89.3072 82.7184 89.3072 81.84V81.84C89.3072 80.5198 88.6905 79.8056 87.9298 80.2448L88.2762 80.0448Z"
                    ></path>
                    <mask fill="white" id="path-28-inside-2_204_217">
                      <path d="M67 94.6603C67 93.3848 67.8954 91.8339 69 91.1962V91.1962C70.1046 90.5584 71 91.0754 71 92.3509V92.5129C71 93.7884 70.1046 95.3393 69 95.977V95.977C67.8954 96.6147 67 96.0978 67 94.8223V94.6603Z"></path>
                    </mask>
                    <path
                      fill="#91DDFB"
                      d="M67 94.6603C67 93.3848 67.8954 91.8339 69 91.1962V91.1962C70.1046 90.5584 71 91.0754 71 92.3509V92.5129C71 93.7884 70.1046 95.3393 69 95.977V95.977C67.8954 96.6147 67 96.0978 67 94.8223V94.6603Z"
                    ></path>
                    <path
                      mask="url(#path-28-inside-2_204_217)"
                      fill="#489CB7"
                      d="M67 92.3509L71 90.0415L67 92.3509ZM71.6928 92.5129C71.6928 94.0093 70.6423 95.8288 69.3464 96.577L69.3464 96.577C68.0505 97.3252 67 96.7187 67 95.2223V94.8223C67 95.6559 67.8954 95.8147 69 95.177L69 95.177C69.7219 94.7602 70.3072 93.7465 70.3072 92.9129L71.6928 92.5129ZM67 97.1317V92.3509V97.1317ZM69.2762 91.0367C70.6109 90.2661 71.6928 90.8908 71.6928 92.4319V92.5129C71.6928 94.0093 70.6423 95.8288 69.3464 96.577L69 95.177C69.7219 94.7602 70.3072 93.7465 70.3072 92.9129V92.7509C70.3072 91.4754 69.7219 90.7794 69 91.1962L69.2762 91.0367Z"
                    ></path>
                  </g>
                  <defs>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="92.0933"
                      x2="92.5421"
                      y1="92.0933"
                      x1="1.00946"
                      id="paint0_linear_204_217"
                    >
                      <stop stop-color="#5727CC"></stop>
                      <stop stop-color="#4354BF" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="91.1638"
                      x2="6.72169"
                      y1="70"
                      x1="92.5"
                      id="paint1_linear_204_217"
                    >
                      <stop stop-color="#4559C4"></stop>
                      <stop stop-color="#332C94" offset="0.29"></stop>
                      <stop stop-color="#5727CB" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="85.0762"
                      x2="3.55544"
                      y1="70"
                      x1="92.5"
                      id="paint2_linear_204_217"
                    >
                      <stop stop-color="#91DDFB"></stop>
                      <stop stop-color="#8841D5" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="32.558"
                      x2="43.5482"
                      y1="28.7976"
                      x1="43.5482"
                      id="paint3_linear_204_217"
                    >
                      <stop stop-color="#5927CE"></stop>
                      <stop stop-color="#91DDFB" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="48.3519"
                      x2="50.0323"
                      y1="44.5915"
                      x1="50.0323"
                      id="paint4_linear_204_217"
                    >
                      <stop stop-color="#5927CE"></stop>
                      <stop stop-color="#91DDFB" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="62.6416"
                      x2="40.3062"
                      y1="59.6332"
                      x1="40.3062"
                      id="paint5_linear_204_217"
                    >
                      <stop stop-color="#5927CE"></stop>
                      <stop stop-color="#91DDFB" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="73.9229"
                      x2="50.7527"
                      y1="68.6583"
                      x1="50.7527"
                      id="paint6_linear_204_217"
                    >
                      <stop stop-color="#5927CE"></stop>
                      <stop stop-color="#91DDFB" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="76.9312"
                      x2="48.5913"
                      y1="74.675"
                      x1="48.5913"
                      id="paint7_linear_204_217"
                    >
                      <stop stop-color="#5927CE"></stop>
                      <stop stop-color="#91DDFB" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="67.1541"
                      x2="52.9153"
                      y1="66.402"
                      x1="52.9153"
                      id="paint8_linear_204_217"
                    >
                      <stop stop-color="#5927CE"></stop>
                      <stop stop-color="#91DDFB" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="43.8394"
                      x2="52.1936"
                      y1="41.5832"
                      x1="52.1936"
                      id="paint9_linear_204_217"
                    >
                      <stop stop-color="#5927CE"></stop>
                      <stop stop-color="#91DDFB" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="29.5497"
                      x2="57.2367"
                      y1="27.2935"
                      x1="57.2367"
                      id="paint10_linear_204_217"
                    >
                      <stop stop-color="#5927CE"></stop>
                      <stop stop-color="#91DDFB" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="34.8144"
                      x2="43.9084"
                      y1="33.3102"
                      x1="43.9084"
                      id="paint11_linear_204_217"
                    >
                      <stop stop-color="#5927CE"></stop>
                      <stop stop-color="#91DDFB" offset="1"></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="16.0743"
                      x2="62.9858"
                      y1="88.5145"
                      x1="67.8638"
                      id="paint12_linear_204_217"
                    >
                      <stop stop-color="#97E6FF"></stop>
                      <stop
                        stop-opacity="0"
                        stop-color="white"
                        offset="1"
                      ></stop>
                    </linearGradient>
                    <linearGradient
                      gradientUnits="userSpaceOnUse"
                      y2="39.4139"
                      x2="31.4515"
                      y1="88.0938"
                      x1="36.2597"
                      id="paint13_linear_204_217"
                    >
                      <stop stop-color="#97E6FF"></stop>
                      <stop
                        stop-opacity="0"
                        stop-color="white"
                        offset="1"
                      ></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}

        <div className="flex-1 text-left flex p-6 sm:p-10 lg:p-20 gap-5 flex-col justify-center">
          <div className="text-left mb-16">
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] `}
            >
              Why Choose StorageX?
            </h2>
            <p>
              Experience the next generation of file storage with cutting-edge
              technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`text-  hover:scale-105 transition-transform duration-200 ${
                  theme === 'dark'
                    ? 'bg-gray-900 border-gray-800 hover:border-[#00BFFF]'
                    : 'bg-white border-gray-200 hover:border-[#00BFFF]'
                }`}
              >
                <CardHeader>
                  <div
                    className={`text-4xl mb-4 font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] `}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle
                    className={`text-xl ${
                      theme === 'dark' ? 'text-[#00BFFF]' : 'text-[#00BFFF]'
                    } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] `}
                  >
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={`${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] `}
                  >
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        {/* Infinite Company Logos Scroll */}

        {/* Technology Section */}
        <div
          className={`py-20 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-[#e6f9ff]'
          }`}
        >
          <div className="text-center mb-16">
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
            >
              Developed by Modern Technology
            </h2>
            <p
              className={`text-lg max-w-5xl mx-auto ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide `}
            >
              Cutting-edge technology stack that seamlessly blends the best of
              modern decentralized and centralized solutions. Experience the
              power of various infrastructures for unmatched security, speed,
              and global accessibility.
            </p>
          </div>
          <InfiniteHorizontalScroll />
        </div>

        {/* CTA Section */}
        {!isAuthenticated && (
          <div className="flex-1 text-left flex p-6 sm:p-10 lg:p-20 gap-5 flex-col justify-center">
            <div
              className={`text-center p-12 rounded-2xl ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700'
                  : 'bg-gradient-to-r from-gray-50 to gray-100 border border-gray-200'
              }`}
            >
              <h2
                className={`text-3xl md:text-4xl font-bold mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide `}
              >
                Ready to Get Started?
              </h2>
              <p
                className={`text-lg mb-8 max-w-2xl mx-auto ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                } font-["Century_Gothic",CenturyGothic,AppleGothic,sans-serif] tracking-wide`}
              >
                Join with many users who trust StorageX for their decentralized
                storage needs
              </p>
              <Link to="/signup">
                <Button
                  size="lg"
                  className={`text-lg px-10 py-4 h-13 text-xl ${
                    theme === 'dark'
                      ? 'bg-[#00BFFF] text-black hover:bg-[#0099CC]'
                      : 'bg-[#00BFFF] text-white hover:bg-[#0099CC]'
                  } tracking-wide`}
                >
                  Start your Journey
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
