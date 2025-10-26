import Spline from '@splinetool/react-spline';

export default function HeroCover() {
  return (
    <div className="h-full w-full relative">
      <Spline scene="https://prod.spline.design/zhZFnwyOYLgqlLWk/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/30" />
    </div>
  );
}
