package com.coopsystem.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {

        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("====================================");
        System.out.println("URI: " + request.getRequestURI());

        final String authHeader = request.getHeader("Authorization");

        System.out.println("Authorization: " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("NO LLEGÓ TOKEN");
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        String username = jwtService.extractUsername(token);

        System.out.println("Usuario del token: " + username);

        if (username != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails =
                    userDetailsService.loadUserByUsername(username);

                    System.out.println("====================================");
                System.out.println("Authorities del UserDetails: " + userDetails.getAuthorities());

            System.out.println("Usuario BD: " + userDetails.getUsername());

            if (jwtService.isTokenValid(token, userDetails.getUsername())) {

                System.out.println("TOKEN VÁLIDO");

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

                        System.out.println("Authentication: " + SecurityContextHolder.getContext().getAuthentication());
                System.out.println("Authorities autenticadas: " +
                
        SecurityContextHolder.getContext().getAuthentication().getAuthorities());

                System.out.println("AUTENTICACIÓN ESTABLECIDA");
            } else {
                System.out.println("TOKEN INVÁLIDO");
            }
        }

        filterChain.doFilter(request, response);
    }
}