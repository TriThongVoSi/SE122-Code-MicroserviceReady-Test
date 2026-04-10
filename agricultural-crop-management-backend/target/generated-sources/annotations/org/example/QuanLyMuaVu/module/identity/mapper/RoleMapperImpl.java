package org.example.QuanLyMuaVu.module.identity.mapper;

import javax.annotation.processing.Generated;
import org.example.QuanLyMuaVu.module.identity.dto.request.RoleRequest;
import org.example.QuanLyMuaVu.module.identity.dto.response.RoleResponse;
import org.example.QuanLyMuaVu.module.identity.entity.Role;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-10T23:42:10+0700",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 23.0.2 (Oracle Corporation)"
)
@Component
public class RoleMapperImpl implements RoleMapper {

    @Override
    public Role toRole(RoleRequest request) {
        if ( request == null ) {
            return null;
        }

        Role.RoleBuilder role = Role.builder();

        role.code( request.getCode() );
        role.name( request.getName() );
        role.description( request.getDescription() );

        return role.build();
    }

    @Override
    public RoleResponse toRoleResponse(Role role) {
        if ( role == null ) {
            return null;
        }

        RoleResponse.RoleResponseBuilder roleResponse = RoleResponse.builder();

        roleResponse.id( role.getId() );
        roleResponse.code( role.getCode() );
        roleResponse.name( role.getName() );
        roleResponse.description( role.getDescription() );

        return roleResponse.build();
    }
}
