function AuthButton({children, type = "button"}){
    return(
        <button
            type = {type}
            className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-900"
        >
            {children}
        </button>
    );
}

export default AuthButton;