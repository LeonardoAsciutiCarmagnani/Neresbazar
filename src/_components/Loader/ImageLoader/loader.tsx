const Loader = () => {
  return (
    <div className="relative flex h-fit w-fit items-center justify-center p-2 ">
      <div className="flex flex-col items-center">
        <div className="mt-4 flex items-center gap-1">
          <span className="flex gap-1">
            <span className="animate-bounce text-amber-600 delay-100 text-md">
              .
            </span>
            <span className="animate-bounce text-amber-600 delay-200 text-md">
              .
            </span>
            <span className="animate-bounce text-amber-600 delay-300 text-md">
              .
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Loader;
