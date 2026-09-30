export default function Card({
    children,
    className = ""
}) {

    return (

        <div
            className={`
                bg-white
                rounded-xl
                shadow-[0_1px_3px_rgba(27,42,65,0.05)]
                border
                border-[#dce5ed]
                p-6
                ${className}
            `}
        >

            {children}

        </div>

    );

}
